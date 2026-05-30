import { AgentMessage, PlanStep, AgentThought, ExecutionResult } from '../types/agent.js';
import { ToolDefinition } from '../types/tool.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import { getLogger } from '../utils/logger.js';
import { generateId } from '../utils/crypto.js';

interface PlanResult {
  steps: PlanStep[];
  reasoning: string;
}

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
    previousResults?: ExecutionResult[]
  ): Promise<AgentThought> {
    const toolsDesc = this.tools
      .map(t => `- ${t.name}: ${t.description} (${t.category})`)
      .join('\n');

    const systemPrompt = `You are a coding agent planner. Given a user request, break it down into steps.

Available tools:
${toolsDesc}

Think step by step:
1. Understand what the user wants
2. Identify which tools to use
3. Break into sequential steps
4. Specify expected outcomes

Respond with a structured plan.`;

    const messages = [
      ...context.slice(-10),
      {
        id: generateId(),
        role: 'user' as const,
        content: `Plan the steps needed for: ${userInput}\n\nConsider what files to read, what commands to run, and what changes to make.`,
        timestamp: new Date(),
      },
    ];

    const response = await this.provider.chat({ messages, systemPrompt });

    const steps = this.parseSteps(response.content);

    return {
      step: 0,
      reasoning: response.content,
      plan: steps.map(s => s.description),
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
        content: `The following step failed:\nStep: ${failedStep.description}\nTool: ${failedStep.tool}\nError: ${error}\n\nRevise the plan to fix this issue.`,
        timestamp: new Date(),
      },
    ];

    const response = await this.provider.chat({ messages });

    return {
      step: failedStep.id as any,
      reasoning: response.content,
      plan: this.parseSteps(response.content).map(s => s.description),
    };
  }

  private parseSteps(content: string): PlanStep[] {
    const steps: PlanStep[] = [];
    const stepRegex = /(?:^|\n)\s*(?:\d+[.)]\s*|\*\s*|\-\s*)?(?:Step\s*\d+[:\s]*)?(.+?)(?:\n|$)/gm;
    let match;

    while ((match = stepRegex.exec(content)) !== null) {
      const description = match[1].trim();
      if (description.length > 10) {
        steps.push({
          id: generateId(),
          description,
          tool: this.inferTool(description),
          input: {},
          status: 'pending',
        });
      }
    }

    return steps;
  }

  private inferTool(description: string): string {
    const lower = description.toLowerCase();

    if (lower.includes('read') || lower.includes('open') || lower.includes('cat ')) return 'file';
    if (lower.includes('run') || lower.includes('exec') || lower.includes('install')) return 'shell';
    if (lower.includes('search') || lower.includes('find') || lower.includes('grep')) return 'search';
    if (lower.includes('write') || lower.includes('create') || lower.includes('edit')) return 'file';

    return 'file';
  }
}
