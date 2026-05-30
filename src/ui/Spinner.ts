import ora, { Ora } from 'ora';
import chalk from 'chalk';

type SpinnerState = 'thinking' | 'planning' | 'executing' | 'reflecting' | 'searching' | 'writing';

const SPINNER_MESSAGES: Record<SpinnerState, string> = {
  thinking: chalk.cyan('Thinking...'),
  planning: chalk.yellow('Planning...'),
  executing: chalk.green('Executing...'),
  reflecting: chalk.magenta('Reflecting...'),
  searching: chalk.blue('Searching...'),
  writing: chalk.cyan('Writing...'),
};

export class Spinner {
  private spinner: Ora | null = null;

  start(state: SpinnerState = 'thinking'): void {
    this.stop();
    this.spinner = ora({
      text: SPINNER_MESSAGES[state],
      spinner: 'dots',
      color: 'cyan',
    }).start();
  }

  succeed(text?: string): void {
    if (this.spinner) {
      this.spinner.succeed(text || chalk.green('Done'));
      this.spinner = null;
    }
  }

  fail(text?: string): void {
    if (this.spinner) {
      this.spinner.fail(text || chalk.red('Failed'));
      this.spinner = null;
    }
  }

  updateText(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  info(text: string): void {
    this.stop();
    ora({ text: chalk.blue('ℹ') + ' ' + text }).info();
  }

  warn(text: string): void {
    this.stop();
    ora({ text: chalk.yellow('⚠') + ' ' + text }).warn();
  }

  error(text: string): void {
    this.stop();
    ora({ text: chalk.red('✖') + ' ' + text }).fail();
  }
}
