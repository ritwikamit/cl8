import ora, { Ora, Color } from 'ora';
import chalk from 'chalk';

export type SpinnerState = 'thinking' | 'planning' | 'executing' | 'reflecting' | 'searching' | 'writing' | 'responding';

interface SpinnerConfig {
  text: string;
  icon: string;
  color: Color;
}

const SPINNER_CONFIG: Record<SpinnerState, SpinnerConfig> = {
  thinking:   { text: 'Thinking',   icon: '🧠', color: 'cyan' },
  planning:   { text: 'Planning',   icon: '📋', color: 'yellow' },
  executing:  { text: 'Executing',  icon: '⚡', color: 'green' },
  reflecting: { text: 'Reflecting', icon: '🔍', color: 'magenta' },
  searching:  { text: 'Searching',  icon: '🔎', color: 'blue' },
  writing:    { text: 'Writing',    icon: '✍️',  color: 'cyan' },
  responding: { text: 'Responding', icon: '💬', color: 'cyan' },
};

export class Spinner {
  private spinner: Ora | null = null;
  private currentState: SpinnerState | null = null;

  start(state: SpinnerState = 'thinking'): void {
    this.stop();
    this.currentState = state;
    const config = SPINNER_CONFIG[state];
    this.spinner = ora({
      text: `${chalk.bold(config.icon)} ${config.text}...`,
      spinner: 'dots12',
      color: config.color,
    }).start();
  }

  succeed(text?: string): void {
    if (this.spinner) {
      this.spinner.succeed(text || chalk.green('✓ Done'));
      this.spinner = null;
      this.currentState = null;
    }
  }

  fail(text?: string): void {
    if (this.spinner) {
      this.spinner.fail(text || chalk.red('✗ Failed'));
      this.spinner = null;
      this.currentState = null;
    }
  }

  update(state: SpinnerState): void {
    if (state === this.currentState) return;
    this.currentState = state;
    const config = SPINNER_CONFIG[state];
    if (this.spinner) {
      this.spinner.color = config.color;
      this.spinner.text = `${chalk.bold(config.icon)} ${config.text}...`;
    }
  }

  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
      this.currentState = null;
    }
  }

  info(text: string): void {
    this.stop();
    const icon = chalk.blue('ℹ');
    console.log(` ${icon} ${text}`);
  }

  warn(text: string): void {
    this.stop();
    const icon = chalk.yellow('⚠');
    console.log(` ${icon} ${text}`);
  }

  error(text: string): void {
    this.stop();
    const icon = chalk.red('✖');
    console.log(` ${icon} ${text}`);
  }
}
