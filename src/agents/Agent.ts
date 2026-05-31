import { Planner } from './Planner.js';
import { Executor } from './Executor.js';
import { Reflector } from './Reflector.js';
import { ToolService } from '../services/ToolService.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import {
  AgentMessage,
  AgentState,
  AgentConfig,
  AgentThought,
  PlanStep,
  ExecutionResult,
} from '../types/agent.js';
import { ToolDefinition, ToolContext } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';
import { generateId } from '../utils/crypto.js';

const DEFAULT_CONFIG: AgentConfig = {
  maxTurns: 25,
  maxRetries: 3,
  temperature: 0.7,
  topP: 0.9,
  systemPrompt: `You are CL8, a terminal-based AI coding and automation assistant.
You help users write, debug, refactor, and understand code.
You can read and write files, execute commands, and search codebases.
Always explain your reasoning clearly and concisely.
Follow security guidelines and never execute dangerous commands without approval.`,
  allowedTools: ['file', 'shell', 'search'],
  contextWindow: 100000,
};

export class Agent {
  private planner: Planner;
  private executor: Executor;
  private reflector: Reflector;
  private provider: BaseProvider;
  private toolService: ToolService;
  private config: AgentConfig;
  private state: AgentState;
  private logger = getLogger();

  constructor(
    provider: BaseProvider,
    toolService: ToolService,
    tools: ToolDefinition[],
    config?: Partial<AgentConfig>
  ) {
    this.provider = provider;
    this.toolService = toolService;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.planner = new Planner(provider, tools);
    this.executor = new Executor(toolService);
    this.reflector = new Reflector(provider);
    this.state = this.createInitialState();
  }

  private createInitialState(): AgentState {
    return {
      status: 'idle',
      turn: 0,
      messages: [],
      thoughts: [],
    };
  }

  async processUserInput(
    input: string,
    sessionId: string,
    workspace: string,
    history: AgentMessage[] = []
  ): Promise<AsyncIterable<string>> {
    return this.processUserInputStream(input, sessionId, workspace, history);
  }

  private async *processUserInputStream(
    input: string,
    sessionId: string,
    workspace: string,
    history: AgentMessage[]
  ): AsyncGenerator<string> {
    this.state = this.createInitialState();
    this.state.status = 'thinking';

    const userMessage: AgentMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    this.state.messages = [...history, userMessage];

    yield* this.runAgentLoop(input, sessionId, workspace);
  }

  private async *runAgentLoop(
    input: string,
    sessionId: string,
    workspace: string
  ): AsyncGenerator<string> {
    if (this.isSimpleQuery(input)) {
      this.state.status = 'responding';
      const response = await this.reflector.generateResponse(input, [], new Map(), {
        step: 0,
        reasoning: '',
        plan: [],
      });
      yield response;
      yield '\n\n';
      this.state.status = 'idle';
      return;
    }

    this.state.status = 'planning';

    const toolContext: ToolContext = {
      workspace,
      sessionId,
      approved: true,
    };

    let thought: AgentThought = await this.planner.createPlan(input, this.state.messages);
    this.state.thoughts.push(thought);
    yield `**Plan:**\n${(thought.plan || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;

    this.state.status = 'executing';
    const steps: PlanStep[] = this.parsePlanSteps(thought);
    const results = new Map<string, ExecutionResult>();

    for (const step of steps) {
      yield `**Executing:** ${step.description}\n\n`;

      if (this.canAutoExecute(step)) {
        const result = await this.executor.executeStep(step, toolContext);
        results.set(step.id, result);

        if (result.success) {
          const preview = result.output.slice(0, 500);
          yield `✅ ${preview}\n\n`;
        } else {
          yield `❌ Error: ${result.error}\n\n`;
        }
      } else {
        results.set(step.id, { success: true, output: '' });
      }

      this.state.turn++;

      if (this.state.turn >= this.config.maxTurns) {
        yield '⚠️ Max turns reached. Stopping.\n\n';
        break;
      }
    }

    this.state.status = 'reflecting';

    const reflection = await this.reflector.reflect(input, steps, results, this.state.messages);

    if (!reflection.satisfied && reflection.needsReplan) {
      yield `**Need to replan:** ${reflection.feedback}\n\n`;

      const failedSteps = steps.filter(s => s.status === 'failed');
      if (failedSteps.length > 0) {
        thought = await this.planner.revisePlan(
          input,
          this.state.messages,
          failedSteps[0],
          failedSteps[0].error || 'Unknown error'
        );
        this.state.thoughts.push(thought);

        yield `**Revised Plan:**\n${(thought.plan || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;

        const newSteps = this.parsePlanSteps(thought);
        for (const step of newSteps) {
          yield `**Executing:** ${step.description}\n\n`;
          if (this.canAutoExecute(step)) {
            const result = await this.executor.executeStep(step, toolContext);
            results.set(step.id, result);
            yield result.success ? `✅ Done\n\n` : `❌ ${result.error}\n\n`;
          }
        }
      }
    }

    this.state.status = 'responding';

    const response = await this.reflector.generateResponse(input, steps, results, thought);
    yield response;
    yield '\n\n';

    this.state.status = 'idle';
  }

  private isSimpleQuery(input: string): boolean {
    const trimmed = input.trim().toLowerCase();
    const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.includes(trimmed)) return true;
    const simplePatterns = [
      /^(hi|hello|hey|yo|sup|howdy)(!|\.)?$/i,
      /^(what'?s up|how are you|how'?s it going|what can you do|who are you|what are you|tell me about yourself)(\?)?$/i,
      /^(thanks|thank you|thx|ty|ok|okay|sure|great|nice|good|awesome|cool|got it)(!|\.)?$/i,
      /^(bye|goodbye|see you|later|cya)(!|\.)?$/i,
    ];
    for (const p of simplePatterns) {
      if (p.test(trimmed)) return true;
    }
    return false;
  }

  private parsePlanSteps(thought: AgentThought): PlanStep[] {
    return (thought.plan || []).map(description => ({
      id: generateId(),
      description,
      tool: this.inferTool(description),
      input: {},
      status: 'pending',
    }));
  }

  private inferTool(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('read') || lower.includes('open') || lower.includes('cat ')) return 'file';
    if (lower.includes('run') || lower.includes('exec') || lower.includes('install') || lower.includes('npm') || lower.includes('git')) return 'shell';
    if (lower.includes('search') || lower.includes('find') || lower.includes('grep') || lower.includes('look')) return 'search';
    if (lower.includes('write') || lower.includes('create') || lower.includes('edit') || lower.includes('save')) return 'file';
    return 'file';
  }

  private canAutoExecute(step: PlanStep): boolean {
    const actionableKeywords = ['read', 'write', 'edit', 'run', 'exec', 'search', 'find', 'grep', 'create', 'delete', 'install', 'list', 'cat'];
    const lower = step.description.toLowerCase();
    if (!actionableKeywords.some(k => lower.includes(k))) {
      return false;
    }
    const analysisPatterns = ['understand what', 'identify which', 'break into', 'specify', 'consider', 'analyze'];
    if (analysisPatterns.some(p => lower.includes(p))) {
      return false;
    }
    return true;
  }

  getState(): AgentState {
    return this.state;
  }

  reset(): void {
    this.state = this.createInitialState();
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }
}
