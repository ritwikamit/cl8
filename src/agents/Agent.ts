import { Planner } from './Planner.js';
import { Executor } from './Executor.js';
import { Reflector } from './Reflector.js';
import { ToolService } from '../services/ToolService.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import {
  AgentMessage,
  AgentState,
  AgentConfig,
  PlanStep,
  ExecutionResult,
} from '../types/agent.js';
import { ToolDefinition, ToolContext } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';
import { generateId } from '../utils/crypto.js';
import chalk from 'chalk';

const DEFAULT_CONFIG: AgentConfig = {
  maxTurns: 25,
  maxRetries: 3,
  temperature: 0.7,
  topP: 0.9,
  systemPrompt: `You are CL8, a terminal-based AI assistant that controls the user's computer.

You can read/write files, run commands, open URLs in the browser, launch apps, and search code.

When the user asks you to do something that requires a tool, output TOOL: lines in this format:
TOOL: <tool_name> | ACTION: <description> | INPUT: <json>

Examples:
TOOL: file | ACTION: Read file | INPUT: {"operation":"read","path":"test.txt"}
TOOL: file | ACTION: Write file | INPUT: {"operation":"write","path":"hello.py","content":"print('hello')"}
TOOL: shell | ACTION: Run command | INPUT: {"command":"dir"}
TOOL: desktop | ACTION: Open browser | INPUT: {"action":"open_url","target":"https://google.com"}
TOOL: desktop | ACTION: Launch notepad | INPUT: {"action":"launch_app","target":"notepad.exe"}
TOOL: search | ACTION: Search code | INPUT: {"pattern":"TODO","include":"*.ts"}

If no tool is needed, just respond directly.`,
  allowedTools: ['file', 'shell', 'search', 'desktop'],
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

  private isGreeting(input: string): boolean {
    const trimmed = input.trim().toLowerCase();
    const pureGreetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'howdy', 'greetings'];
    if (pureGreetings.includes(trimmed)) return true;

    const greetingPatterns = [
      /^(hi|hello|hey|yo|sup|howdy)(!|\.)?$/i,
      /^(what'?s up|how are you|how'?s it going)(\?)?$/i,
    ];
    for (const p of greetingPatterns) {
      if (p.test(trimmed)) return true;
    }
    return false;
  }

  private async *runAgentLoop(
    input: string,
    sessionId: string,
    workspace: string
  ): AsyncGenerator<string> {
    if (this.isGreeting(input)) {
      this.state.status = 'responding';
      yield 'Hello! How can I help you today?';
      yield '\n\n';
      this.state.status = 'idle';
      return;
    }

    const toolContext: ToolContext = {
      workspace,
      sessionId,
      approved: this.config.autoApprove === true,
    };

    const toolList = this.config.allowedTools
      .map(t => {
        const def = this.toolService.getTools().find(d => d.name === t);
        return def ? `- ${def.name}: ${def.description}` : `- ${t}`;
      }).join('\n');

    const systemPrompt = `${this.config.systemPrompt}\n\nAvailable:\n${toolList}`;

    this.state.status = 'thinking';

    const messages: AgentMessage[] = this.state.messages.slice(-10);

    let fullResponse = '';
    let lineBuffer = '';

    try {
      const stream = this.provider.chatStream({
        messages,
        systemPrompt,
        maxTokens: 4096,
        temperature: this.config.temperature,
      });

      for await (const chunk of stream) {
        lineBuffer += chunk.content;
        let newlineIdx;
        while ((newlineIdx = lineBuffer.indexOf('\n')) >= 0) {
          const line = lineBuffer.slice(0, newlineIdx);
          lineBuffer = lineBuffer.slice(newlineIdx + 1);
          if (line.trim().startsWith('TOOL:')) {
            fullResponse += line + '\n';
          } else {
            fullResponse += line + '\n';
            yield line + '\n';
          }
        }
      }
      if (lineBuffer.length > 0) {
        if (lineBuffer.trim().startsWith('TOOL:')) {
          fullResponse += lineBuffer;
        } else {
          fullResponse += lineBuffer;
          yield lineBuffer;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.state.status = 'error';
      this.state.error = message;
      yield `\nError: ${message}\n\n`;
      this.state.status = 'idle';
      return;
    }

    const steps = this.parseInlineSteps(fullResponse);

    if (steps.length === 0) {
      this.state.status = 'idle';
      return;
    }

    this.state.status = 'executing';

    const results = new Map<string, ExecutionResult>();

    for (const step of steps) {
      this.state.turn++;
      yield `\n  ${this.colorArrow('→')} ${step.description}...`;

      try {
        const result = await this.executor.executeStep(step, toolContext);
        results.set(step.id, result);

        if (result.success) {
          yield ` ${this.colorCheck('✓')}\n`;
          if (result.output && result.output.length < 300) {
            yield `    ${result.output}\n`;
          }
        } else {
          yield ` ${this.colorCross('✗')}\n`;
          if (result.error) {
            yield `    ${result.error}\n`;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        yield ` ${this.colorCross('✗')}\n`;
        yield `    ${message}\n`;
      }

      if (this.state.turn >= this.config.maxTurns) {
        yield `\n  ⚠ Max turns reached.\n`;
        break;
      }
    }

    this.state.status = 'idle';
    yield '\n';
  }

  private parseInlineSteps(response: string): PlanStep[] {
    const steps: PlanStep[] = [];
    const lines = response.split('\n');

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

    return steps;
  }

  private colorArrow(text: string): string {
    return chalk.hex('#A855F7')(text);
  }

  private colorCheck(text: string): string {
    return chalk.green(text);
  }

  private colorCross(text: string): string {
    return chalk.red(text);
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

  setAutoApprove(val: boolean): void {
    this.config.autoApprove = val;
  }
}
