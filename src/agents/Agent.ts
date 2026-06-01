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
      yield* this.reflector.generateResponseStream(input, [], new Map(), {
        step: 0,
        reasoning: 'Direct response for simple query.',
        plan: [],
      });
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
    
    if (thought.plan && thought.plan.length > 0) {
      yield `**Plan:**\n${thought.plan.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
    }

    this.state.status = 'executing';
    const steps: PlanStep[] = this.parsePlanSteps(thought);
    const results = new Map<string, ExecutionResult>();

    if (steps.length === 0) {
      this.state.status = 'responding';
      yield* this.reflector.generateResponseStream(input, [], new Map(), thought);
      yield '\n\n';
      this.state.status = 'idle';
      return;
    }

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

        if (thought.plan && thought.plan.length > 0) {
          yield `**Revised Plan:**\n${thought.plan.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        }

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

    yield* this.reflector.generateResponseStream(input, steps, results, thought);
    yield '\n\n';

    this.state.status = 'idle';
  }

  private isSimpleQuery(input: string): boolean {
    const trimmed = input.trim().toLowerCase();
    
    // Basic greetings and courtesies
    const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.includes(trimmed)) return true;

    const simplePatterns = [
      /^(hi|hello|hey|yo|sup|howdy)(!|\.)?$/i,
      /^(what'?s up|how are you|how'?s it going|what can you do|who are you|what are you|tell me about yourself)(\?)?$/i,
      /^(thanks|thank you|thx|ty|ok|okay|sure|great|nice|good|awesome|cool|got it)(!|\.)?$/i,
      /^(bye|goodbye|see you|later|cya)(!|\.)?$/i,
    ];

    // Detect simple coding requests that don't need complex planning or tool execution.
    // We avoid triggering this if the user asks to "run", "install", "create", "save", or "fix".
    const actionKeywords = ['run', 'install', 'create', 'save', 'fix', 'execute', 'apply', 'setup', 'build', 'deploy', 'search'];
    const hasActionKeyword = actionKeywords.some(kw => trimmed.includes(kw));

    if (hasActionKeyword) return false;

    const codingPatterns = [
      /print.*(pyramid|pattern|loop|array|string)/i,
      /how to.*(loop|if|else|switch|function|class)/i,
      /write.*(java|python|javascript|js|ts|c\+\+|cpp|c#).*program.*to/i,
      /example of.*(sort|filter|map|reduce|recursion)/i,
      /explain.*(bubble sort|binary search|linked list|stack|queue)/i,
      /^(fibonacci|factorial|prime number|palindrome)/i
    ];

    const allPatterns = [...simplePatterns, ...codingPatterns];
    for (const p of allPatterns) {
      if (p.test(trimmed)) return true;
    }

    // Length-based heuristic: very short inputs are likely simple queries
    if (trimmed.split(/\s+/).length <= 3 && !trimmed.includes('/') && !trimmed.includes('\\')) {
      return true;
    }

    return false;
  }

  private parsePlanSteps(thought: AgentThought): PlanStep[] {
    if (thought.steps && thought.steps.length > 0) {
      return thought.steps.map(s => ({ ...s, status: 'pending' as const }));
    }
    // REMOVED: Dangerous fallback that treated plan text as shell commands
    return [];
  }

  private canAutoExecute(step: PlanStep): boolean {
    return step.tool === 'shell' || step.tool === 'file' || step.tool === 'search';
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
