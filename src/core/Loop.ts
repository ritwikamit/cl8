import readline from 'node:readline';
import chalk from 'chalk';
import { Engine } from './Engine.js';
import { SpinnerManager, SpinnerState } from '../ui/spinner-manager.js';
import { StreamingOutput } from '../ui/StreamingOutput.js';
import { markdown } from '../ui/MarkdownRenderer.js';
import { ThemeManager } from '../ui/theme-manager.js';
import { generateId } from '../utils/crypto.js';
import { AgentMessage, AgentStatus } from '../types/agent.js';
import { getLogger } from '../utils/logger.js';

const STATUS_MAP: Record<AgentStatus, SpinnerState> = {
  idle: 'thinking',
  thinking: 'thinking',
  planning: 'planning',
  executing: 'executing',
  reflecting: 'reflecting',
  responding: 'responding',
  error: 'thinking',
};

const SLASH_COMMANDS: Record<string, { description: string; handler: (args: string) => Promise<string | null> }> = {
  '/help': {
    description: 'Show available commands',
    handler: async () => `## Available Commands

  \`/help\`       - Show this help message
  \`/clear\`      - Clear the conversation
  \`/reset\`      - Reset the agent state
  \`/status\`     - Show current session info
  \`/session\`    - Show session details
  \`/tokens\`     - Show token usage
  \`/mode <ask|auto|deny>\` - Set approval mode
  \`/exit\`       - Exit CL8

## Tips
- Type naturally to ask questions or request tasks
- Use multi-line input with \\\\ at end of line
- Press Ctrl+C to cancel current operation
- Press Ctrl+D to exit`,
  },
  '/clear': {
    description: 'Clear conversation',
    handler: async () => null,
  },
  '/reset': {
    description: 'Reset agent state',
    handler: async () => 'Agent state has been reset.',
  },
  '/status': {
    description: 'Show session info',
    handler: async () => {
      return '## Session Status\n\nActive session running.';
    },
  },
  '/exit': {
    description: 'Exit CL8',
    handler: async () => {
      process.exit(0);
    },
  },
};

export class InteractiveLoop {
  private engine: Engine;
  private sessionId: string;
  private spinner: SpinnerManager;
  private output: StreamingOutput;
  private rl: readline.Interface;
  private logger = getLogger();
  private running = true;
  private multiLineBuffer: string[] = [];
  private theme: ThemeManager;

  constructor(engine: Engine, theme: ThemeManager, sessionId?: string) {
    this.engine = engine;
    this.theme = theme;
    this.sessionId = sessionId || generateId();
    this.spinner = new SpinnerManager();
    this.output = new StreamingOutput();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '',
      terminal: true,
    });
  }

  async start(): Promise<void> {
    await this.engine.initialize();
    this.showHelpHint();
    await this.promptLoop();
  }

  private showHelpHint(): void {
    console.log(chalk.dim('  Type /help for commands · Ctrl+C to cancel · Ctrl+D to exit'));
    console.log();
  }

  private async promptLoop(): Promise<void> {
    while (this.running) {
      const input = await this.getInput();

      if (input === null) {
        this.running = false;
        break;
      }

  let trimmed = input.trim();
    if (!trimmed && this.multiLineBuffer.length === 0) continue;

    if (trimmed.endsWith('\\')) {
      this.multiLineBuffer.push(trimmed.slice(0, -1));
        console.log(chalk.dim('  ... continuing'));
        continue;
      }

      if (this.multiLineBuffer.length > 0) {
        this.multiLineBuffer.push(trimmed);
        trimmed = this.multiLineBuffer.join('\n');
        this.multiLineBuffer = [];
      }

      if (trimmed.startsWith('/')) {
        await this.handleCommand(trimmed);
      } else {
        await this.handleUserInput(trimmed);
      }
    }

    this.cleanup();
  }

  private getInput(): Promise<string | null> {
    return new Promise(resolve => {
      this.rl.question(`${chalk.hex('#6C5CE7')('cl8')}${chalk.dim(' > ')}`, (answer: string) => {
        resolve(answer);
      });
      this.rl.on('SIGINT', () => {
        console.log('\n');
        resolve(null);
      });
    });
  }

  private async handleUserInput(input: string): Promise<void> {
    const userMessage: AgentMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    await this.engine.addMessage(this.sessionId, userMessage);

    try {
      const stream = await this.engine.processUserInput(input, this.sessionId);
      this.spinner.start('thinking');
      this.output.start();

      for await (const chunk of stream) {
        this.spinner.stop();
        this.output.append(chunk);
        const status = this.engine.getAgent().getState().status;
        this.spinner.start(STATUS_MAP[status] || 'thinking');
      }

      this.spinner.succeed();
      this.output.stop();

      const responseContent = this.output.getContent();
      const assistantMessage: AgentMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      await this.engine.addMessage(this.sessionId, assistantMessage);
    } catch (err) {
      this.spinner.fail();
      const message = err instanceof Error ? err.message : String(err);
      console.log(chalk.red(`\n✖ Error: ${message}\n`));
      this.logger.error('Processing error', { error: message });
    }
  }

  private async handleCommand(input: string): Promise<void> {
    const [cmd, ...argsArr] = input.split(' ');
    const args = argsArr.join(' ');

    const command = SLASH_COMMANDS[cmd.toLowerCase()];
    if (!command) {
      console.log(chalk.yellow(`Unknown command: ${cmd}. Type /help for available commands.\n`));
      return;
    }

    if (cmd === '/clear') {
      this.output.clear();
      console.clear();
      return;
    }

    if (cmd === '/mode') {
      const mode = args.toLowerCase();
      if (['ask', 'auto', 'deny'].includes(mode)) {
        this.engine.getSecurityService().setApprovalMode(mode as any);
        console.log(chalk.green(`Approval mode set to: ${mode}\n`));
      } else {
        console.log(chalk.yellow('Usage: /mode <ask|auto|deny>\n'));
      }
      return;
    }

    if (cmd === '/reset') {
      this.engine.getAgent().reset();
      console.log(chalk.green('Agent reset.\n'));
      return;
    }

    if (cmd === '/session') {
      const session = this.engine.getSessionManager().getCurrentSession();
      if (session) {
        console.log(chalk.cyan(JSON.stringify(session, null, 2)) + '\n');
      }
      return;
    }

    const result = await command.handler(args);
    if (result) {
      const rendered = markdown.render(result);
      console.log(rendered);
    }
  }

  private cleanup(): void {
    this.rl.close();
    this.engine.shutdown();
    console.log(chalk.hex('#6C5CE7')('\n  Goodbye! 👋\n'));
  }
}
