import chalk from 'chalk';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DOTS = ['', '.', '..', '...'];
const COLORS = ['#A855F7', '#C084FC', '#D946EF', '#E879F9', '#C026D3', '#9333EA'];

export class ThinkingAnimation {
  private interval: NodeJS.Timeout | null = null;
  private frame = 0;
  private running = false;

  start(text = 'cl8 is thinking'): void {
    if (this.running) return;
    this.running = true;
    this.frame = 0;

    const animate = () => {
      if (!this.running) return;
      const spin = SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length];
      const colorIdx = Math.floor(this.frame / 2) % COLORS.length;
      const color = COLORS[colorIdx];
      const dotCount = (Math.floor(this.frame / 4)) % 4;
      const dots = '.'.repeat(dotCount);
      const padding = ' '.repeat(3 - dotCount);

      const line = `${chalk.hex(color)(spin)}  ${chalk.dim(text)}${chalk.hex(color)(dots)}${chalk.dim(padding)}`;
      process.stderr.write(`\r${line}`);
      this.frame++;
    };

    animate();
    this.interval = setInterval(animate, 100);
  }

  stop(): void {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stderr.write('\r' + ' '.repeat(60) + '\r');
  }

  isRunning(): boolean { return this.running; }
}
