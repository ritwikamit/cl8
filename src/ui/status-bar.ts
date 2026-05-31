import chalk from 'chalk';
import { ThemeManager } from './theme-manager.js';

export interface StatusBarData {
  workspace: string;
  model: string;
  contextPercent: number;
  provider: string;
}

export class StatusBar {
  private theme: ThemeManager;

  constructor(theme: ThemeManager) {
    this.theme = theme;
  }

  render(data: StatusBarData): void {
    const cols = process.stdout.columns || 80;
    const ws = this.shortenPath(data.workspace, 28);
    const modelTag = `CL8 · ${data.model}`;
    const ctx = this.formatContext(data.contextPercent);
    const ctxColor = this.contextColor(data.contextPercent);

    const left = chalk.dim(ws);
    const center = chalk.hex('#A855F7')(modelTag);
    const right = ctxColor(ctx);

    const totalLen = this.stripAnsi(left).length + this.stripAnsi(center).length + this.stripAnsi(right).length + 4;
    const pad = cols > totalLen ? cols - totalLen : 2;
    const spaces = ' '.repeat(Math.max(2, pad));

    const bar = `${left}${spaces}${center}${spaces}${right}`;
    process.stdout.write(chalk.hex('#333')(`─`.repeat(cols)) + '\n');
    process.stdout.write(bar + '\n');
  }

  private stripAnsi(s: string): string {
    return s.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private shortenPath(p: string, maxLen: number): string {
    if (p.length <= maxLen) return p;
    const parts = p.replace(/\\/g, '/').split('/');
    if (parts.length <= 2) return '…' + p.slice(-maxLen + 1);
    const head = parts.slice(0, 1);
    const tail = parts.slice(-2);
    return `${head}/…/${tail.join('/')}`;
  }

  private formatContext(percent: number): string {
    return `${percent}% Context Left`;
  }

  private contextColor(percent: number) {
    if (percent <= 10) return chalk.red;
    if (percent <= 20) return chalk.yellow;
    return chalk.green;
  }
}
