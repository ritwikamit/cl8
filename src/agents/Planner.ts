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

For each step, output EXACTLY ONE LINE in this format:
TOOL: <tool_name> | ACTION: <brief description> | INPUT: <json arguments for the tool>

Rules:
- Use "file" tool for reading, writing, creating, editing files. Input: { "operation": "read"|"write"|"edit"|"delete"|"list", "path": "filepath", "content": "file content (for write)" }
- Use "shell" tool for running commands. Input: { "command": "the command to run" }
- Use "search" tool for searching code. Input: { "pattern": "search term", "path": "directory" }
- Do NOT include markdown formatting, bullet points, or numbered lists
- Each step must have valid JSON input matching the tool's input schema
- Split complex tasks into small, single-action steps`;

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

    return {
      step: 0,
      reasoning: response.content,
      plan: steps.map(s => s.description),
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
    return {
      step: 0,
      reasoning: response.content,
      plan: revisedSteps.map(s => s.description),
      steps: revisedSteps,
    };
  }

  private parseSteps(content: string): PlanStep[] {
    const steps: PlanStep[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('TOOL:')) continue;

      const toolMatch = trimmed.match(/TOOL:\s*(\w+)/i);
      const actionMatch = trimmed.match(/ACTION:\s*(.+?)(?=\s*\|\s*INPUT|\s*$)/i);
      const inputMatch = trimmed.match(/INPUT:\s*(\{.+?\})/is);

      if (!toolMatch) continue;

      const tool = toolMatch[1].toLowerCase();
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

    return steps.length > 0 ? steps : [{ id: generateId(), description: content.slice(0, 100), tool: 'shell', input: { command: content }, status: 'pending' }];
  }
}
