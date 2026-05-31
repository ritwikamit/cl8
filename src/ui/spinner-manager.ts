import ora, { Ora, Color } from 'ora';
import chalk from 'chalk';

type SpinnerStyle = 'dots12' | 'dots' | 'shark' | 'bouncingBar' | 'arc' | 'circle' | 'moon';

export type SpinnerState =
  | 'booting'
  | 'loading'
  | 'thinking'
  | 'planning'
  | 'executing'
  | 'reflecting'
  | 'searching'
  | 'writing'
  | 'responding';

interface SpinnerConfig {
  text: string;
  icon: string;
  color: Color;
  style: SpinnerStyle;
}

const SPINNER_CONFIG: Record<SpinnerState, SpinnerConfig> = {
  booting:    { text: 'Booting',     icon: '🚀', color: 'blue',     style: 'dots12' },
  loading:    { text: 'Loading',     icon: '⏳', color: 'blue',     style: 'dots12' },
  thinking:   { text: 'Thinking',    icon: '🧠', color: 'cyan',     style: 'dots12' },
  planning:   { text: 'Planning',    icon: '📋', color: 'yellow',   style: 'dots12' },
  executing:  { text: 'Executing',   icon: '⚡', color: 'green',    style: 'bouncingBar' },
  reflecting: { text: 'Reflecting',  icon: '🔍', color: 'magenta',  style: 'dots12' },
  searching:  { text: 'Searching',   icon: '🔎', color: 'blue',     style: 'dots12' },
  writing:    { text: 'Writing',     icon: '✍️',  color: 'cyan',    style: 'dots12' },
  responding: { text: 'Responding',  icon: '💬', color: 'cyan',     style: 'dots12' },
};

const LOADING_FRAMES = ['■', '□', '▪', '▫'];
const PULSE_FRAMES = ['█', '▓', '▒', '░'];

export class SpinnerManager {
  private spinner: Ora | null = null;
  private currentState: SpinnerState | null = null;
  readonly reducedMotion: boolean;

  constructor(reducedMotion = false) {
    this.reducedMotion = reducedMotion;
  }

  start(state: SpinnerState = 'loading'): void {
    this.stop();
    if (this.reducedMotion) {
      const c = SPINNER_CONFIG[state];
      console.log(` ${c.icon} ${c.text}...`);
      return;
    }
    this.currentState = state;
    const config = SPINNER_CONFIG[state];
    this.spinner = ora({
      text: `${chalk.bold(config.icon)} ${config.text}...`,
      spinner: config.style,
      color: config.color,
    }).start();
  }

  succeed(text?: string): void {
    if (this.reducedMotion) {
      console.log(` ✓ ${text || 'Done'}`);
      return;
    }
    if (this.spinner) {
      this.spinner.succeed(text || chalk.green('✓ Done'));
      this.spinner = null;
      this.currentState = null;
    }
  }

  fail(text?: string): void {
    if (this.reducedMotion) {
      console.log(` ✗ ${text || 'Failed'}`);
      return;
    }
    if (this.spinner) {
      this.spinner.fail(text || chalk.red('✗ Failed'));
      this.spinner = null;
      this.currentState = null;
    }
  }

  update(state: SpinnerState): void {
    if (state === this.currentState) return;
    if (this.reducedMotion) {
      this.currentState = state;
      const c = SPINNER_CONFIG[state];
      console.log(` ${c.icon} ${c.text}...`);
      return;
    }
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
    console.log(` ${chalk.blue('ℹ')} ${text}`);
  }

  warn(text: string): void {
    this.stop();
    console.log(` ${chalk.yellow('⚠')} ${text}`);
  }

  error(text: string): void {
    this.stop();
    console.log(` ${chalk.red('✖')} ${text}`);
  }

  static getLoadingFrames(): string[] {
    return LOADING_FRAMES;
  }

  static getPulseFrames(): string[] {
    return PULSE_FRAMES;
  }
}
