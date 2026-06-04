import readline from 'node:readline';
import chalk from 'chalk';
import { Engine } from './Engine.js';
import { SpinnerManager, SpinnerState } from '../ui/spinner-manager.js';
import { markdown } from '../ui/MarkdownRenderer.js';
import { ThemeManager } from '../ui/theme-manager.js';
import { generateId } from '../utils/crypto.js';
import { readFileAsAttachment } from '../utils/file.js';
import { AgentMessage, AgentStatus, Attachment } from '../types/agent.js';
import { getLogger } from '../utils/logger.js';

const STATUS_MAP: Record<AgentStatus, SpinnerState> = {
  idle: 'thinking',
  thinking: 'thinking',
  planning: 'thinking',
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
  \`/mode <default|review|full>\` - Set access mode
  \`/upload <path>\` - Upload an image or text file
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
  '/upload': {
    description: 'Upload a file (image or text) for the AI to see',
    handler: async () => null,
  },
  '/exit': {
    description: 'Exit CL8',
    handler: async () => {
      process.exit(0);
    },
  },
};

const branch = chalk.hex('#A855F7');

export class InteractiveLoop {
  private engine: Engine;
  private sessionId: string;
  private spinner: SpinnerManager;
  private rl: readline.Interface;
  private logger = getLogger();
  private running = true;
  private multiLineBuffer: string[] = [];
  private theme: ThemeManager;
  private pendingAttachments: Attachment[] = [];

  constructor(engine: Engine, theme: ThemeManager, sessionId?: string) {
    this.engine = engine;
    this.theme = theme;
    this.sessionId = sessionId || generateId();
    this.spinner = new SpinnerManager();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '',
      terminal: true,
    });

    this.rl.on('SIGINT', () => {
      this.spinner.stop();
      console.log();
      // On SIGINT, we just want to clear the line and show a new prompt if we are idle
      if (!this.spinner.reducedMotion) {
        process.stdout.write('\n');
      }
    });

    this.rl.on('close', () => {
      if (this.running) {
        this.running = false;
        this.cleanup();
      }
    });
  }

  async start(): Promise<void> {
    try {
      await this.engine.initialize();
      this.showHelpHint();
      await this.promptLoop();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Fatal error in CLI loop', { error: message });
      console.log(chalk.red(`\n  ✖ Fatal error: ${message}\n`));
      process.exit(1);
    }
  }

  async promptRestoreSession(): Promise<boolean> {
    return new Promise(resolve => {
      this.rl.question(chalk.dim(' Restore previous session? (Y/n) '), (answer: string) => {
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  }

  setSessionId(id: string): void {
    this.sessionId = id;
  }

  private showHelpHint(): void {
    console.log(chalk.dim('  Type /help for commands · Ctrl+C to cancel · Ctrl+D to exit'));
    console.log();
  }

  private async promptLoop(): Promise<void> {
    while (this.running) {
      try {
        const input = await this.getInput();

        if (input === null || input === undefined) {
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error('Loop error', { error: message });
        console.log(chalk.yellow(`\n  ⚠ Loop error: ${message}\n`));
      }
    }

    if (this.running) {
      this.running = false;
      this.cleanup();
    }
  }

  private getInput(): Promise<string | null> {
    return new Promise(resolve => {
      const prompt = `${branch('◆')} ${branch('cl8')}${chalk.dim(' > ')}`;
      
      const onInterfaceClose = () => {
        resolve(null);
      };

      this.rl.once('close', onInterfaceClose);

      this.rl.question(prompt, (answer: string) => {
        this.rl.removeListener('close', onInterfaceClose);
        resolve(answer);
      });
    });
  }

  private async handleUserInput(input: string): Promise<void> {
    let content = input;
    const imageAttachments: Attachment[] = [];

    for (const att of this.pendingAttachments) {
      if (att.type === 'image') {
        imageAttachments.push(att);
      } else {
        content = `[${att.name}]\n${att.data}\n\n${content}`;
      }
    }

    const attachments = imageAttachments.length > 0 ? imageAttachments : undefined;
    this.pendingAttachments = [];

    const userMessage: AgentMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    await this.engine.addMessage(this.sessionId, userMessage);

    try {
      const stream = await this.engine.processUserInput(input, this.sessionId);
      this.spinner.start('thinking');

      let responseContent = '';
      let started = false;

      for await (const chunk of stream) {
        if (!started) {
          this.spinner.stop();
          started = true;
        }

        process.stdout.write(chunk);
        responseContent += chunk;
      }

      if (!started) {
        this.spinner.stop();
      }

      if (responseContent) {
        process.stdout.write('\n\n');
      }

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
      console.clear();
      return;
    }

    if (cmd === '/mode') {
      const mode = args.toLowerCase();
      const MODE_MAP: Record<string, { approval: string; autoApprove: boolean; label: string }> = {
        default: { approval: 'ask', autoApprove: false, label: 'Default (ask before dangerous operations)' },
        review: { approval: 'auto', autoApprove: false, label: 'Review (auto-approve safe operations)' },
        full: { approval: 'auto', autoApprove: true, label: 'Full access (auto-approve everything)' },
        ask: { approval: 'ask', autoApprove: false, label: 'Ask before dangerous operations' },
        auto: { approval: 'auto', autoApprove: false, label: 'Auto-approve safe operations' },
        deny: { approval: 'deny', autoApprove: false, label: 'Deny all operations' },
      };

      const entry = MODE_MAP[mode];
      if (entry) {
        this.engine.getSecurityService().setApprovalMode(entry.approval as any);
        this.engine.getAgent().setAutoApprove(entry.autoApprove);
        const color = mode === 'full' ? chalk.hex('#A855F7').bold : chalk.green;
        console.log(color(`  ✓ Access mode: ${entry.label}\n`));
      } else {
        console.log(chalk.yellow('  Usage: /mode <default|review|full>\n'));
        console.log(chalk.dim('    default  - Ask before dangerous operations'));
        console.log(chalk.dim('    review   - Auto-approve safe operations'));
        console.log(chalk.dim('    full     - Auto-approve everything'));
        console.log();
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

    if (cmd === '/upload') {
      if (!args) {
        console.log(chalk.yellow('Usage: /upload <filepath>\n'));
        return;
      }
      try {
        const attachment = await readFileAsAttachment(args);
        this.pendingAttachments.push(attachment);
        const size = attachment.type === 'image'
          ? `${(Buffer.from(attachment.data, 'base64').length / 1024).toFixed(0)} KB`
          : `${(attachment.data.length / 1024).toFixed(0)} KB`;
        console.log(`  ${chalk.green('✓')} ${chalk.bold(attachment.name)} (${size})`);
        if (attachment.type === 'image') {
          console.log(chalk.dim('  Type your message to send it with the image.'));
        } else {
          console.log(chalk.dim('  File content will be included with your next message.'));
        }
        console.log();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(`  ${chalk.red('✖')} ${message}\n`);
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
