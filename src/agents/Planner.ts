import { AgentMessage, PlanStep, AgentThought, ExecutionResult } from '../types/agent.js';
import { ToolDefinition } from '../types/tool.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import { getLogger } from '../utils/logger.js';
import { generateId } from '../utils/crypto.js';

export class Planner {
  private provider: BaseProvider;
  private tools: ToolDefinition[];
  private logger = getLogger();

  constructor(provider: BaseProvider, tools: ToolDefinition[]) {
    this.provider = provider;
    this.tools = tools;
  }

  async createPlan(
    userInput: string,
    context: AgentMessage[],
    _previousResults?: ExecutionResult[]
  ): Promise<AgentThought> {
    const toolsDesc = this.tools
      .map(t => {
        const schemaProps = t.inputSchema?.properties
          ? Object.entries(t.inputSchema.properties)
              .map(([k, v]) => `    - ${k} (${(v as any).type}): ${(v as any).description || ''}`)
              .join('\n')
          : '';
        return `- ${t.name}: ${t.description}\n${schemaProps}`;
      })
      .join('\n');

    const systemPrompt = `You are a coding agent planner. Break user requests into sequential steps.

Available tools:
${toolsDesc}

For each step that requires a tool, output ONE LINE in this format:
TOOL: <tool_name> | ACTION: <brief description> | INPUT: <json>

EXAMPLES:
User: "create a file called hello.py that prints hello"
TOOL: file | ACTION: Create hello.py | INPUT: {"operation":"write","path":"hello.py","content":"print('hello')"}

User: "open google in browser"
TOOL: desktop | ACTION: Open google | INPUT: {"action":"open_url","target":"https://google.com"}

User: "run npm install"
TOOL: shell | ACTION: Install npm dependencies | INPUT: {"command":"npm install","workdir":"."}

User: "search for all TODO comments"
TOOL: search | ACTION: Search for TODO | INPUT: {"pattern":"TODO","include":"*.ts"}

User: "launch notepad"
TOOL: desktop | ACTION: Open notepad | INPUT: {"action":"launch_app","target":"notepad.exe"}

Rules:
- Use "file" tool for reading, writing, creating, editing files.
- Use "shell" tool for running commands.
- Use "search" tool for searching code.
- Use "desktop" tool for opening URLs or launching apps.
- Each TOOL: line must have valid JSON matching the tool's input schema.
- Do NOT use markdown formatting (like **bolding**) on TOOL: lines.
- Do NOT output TOOL: lines for internal reasoning or planning steps.
- Split complex tasks into small, single-action steps.
- If no tool is needed, just describe the step in plain text.`;

    const messages = [
      ...context.slice(-10),
      {
        id: generateId(),
        role: 'user' as const,
        content: `Plan the steps needed for: ${userInput}`,
        timestamp: new Date(),
      },
    ];

    const response = await this.provider.chat({
      messages,
      systemPrompt,
      maxTokens: 1024,
      temperature: 0.1,
    });

    const steps = this.parseSteps(response.content);
    const plan = this.parsePlan(response.content);

    return {
      step: 0,
      reasoning: response.content,
      plan,
      steps,
    };
  }

  async revisePlan(
    userInput: string,
    context: AgentMessage[],
    failedStep: PlanStep,
    error: string
  ): Promise<AgentThought> {
    const messages: AgentMessage[] = [
      ...context.slice(-5),
      {
        id: generateId(),
        role: 'user' as const,
        content: `The following step failed:\nStep: ${failedStep.description}\nTool: ${failedStep.tool}\nError: ${error}\n\nRevise the plan to fix this issue. Output steps in the same TOOL | ACTION | INPUT format.`,
        timestamp: new Date(),
      },
    ];

    const response = await this.provider.chat({
      messages,
      maxTokens: 1024,
      temperature: 0.1,
    });

    const revisedSteps = this.parseSteps(response.content);
    const plan = this.parsePlan(response.content);

    return {
      step: 0,
      reasoning: response.content,
      plan,
      steps: revisedSteps,
    };
  }

  parseToThought(response: string): AgentThought {
    const steps = this.parseSteps(response);
    const plan = this.parsePlan(response);
    return { step: 0, reasoning: response, plan, steps };
  }

  private parsePlan(content: string): string[] {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^TOOL:\s*\w+\s*\|\s*ACTION:\s*/i, ''))
      .map(line => line.replace(/\s*\|\s*INPUT:.*$/i, ''));
  }

  private parseSteps(content: string): PlanStep[] {
    const steps: PlanStep[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for TOOL: marker even if bolded or having prefix
      const toolLineMatch = trimmed.match(/(?:\*\*|__)?TOOL:\s*(\w+)/i);
      if (!toolLineMatch) continue;

      const tool = toolLineMatch[1].toLowerCase();
      
      // Robust extraction of action and input, ignoring possible bolding at the end
      const actionMatch = trimmed.match(/ACTION:\s*(.+?)(?=\s*\|\s*INPUT|\s*\*|$)/i);
      const inputMatch = trimmed.match(/INPUT:\s*(\{.+?\})(?:\s*\*|$)/is);

      const description = actionMatch ? actionMatch[1].trim() : trimmed;
      let input: Record<string, unknown> = {};

      if (inputMatch) {
        try {
          input = JSON.parse(inputMatch[1]);
        } catch {
          input = {};
        }
      }

      steps.push({
        id: generateId(),
        description,
        tool,
        input,
        status: 'pending',
      });
    }

    return steps;
  }
}
