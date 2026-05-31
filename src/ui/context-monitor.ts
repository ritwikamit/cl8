import chalk from 'chalk';

export class ContextMonitor {
  private tokensUsed = 0;
  private maxTokens = 100000;
  private totalMessages = 0;

  update(tokensUsed: number, totalMessages: number, maxTokens?: number): void {
    this.tokensUsed = tokensUsed;
    this.totalMessages = totalMessages;
    if (maxTokens) this.maxTokens = maxTokens;
  }

  getPercentRemaining(): number {
    return Math.max(0, Math.round((1 - this.tokensUsed / this.maxTokens) * 100));
  }

  getBar(length = 20): string {
    const pct = this.tokensUsed / this.maxTokens;
    const filled = Math.round(pct * length);
    const empty = length - filled;
    const color = pct > 0.8 ? chalk.red : pct > 0.7 ? chalk.yellow : chalk.green;
    return color('█'.repeat(Math.max(0, filled))) + chalk.dim('░'.repeat(Math.max(0, empty)));
  }

  getSummary(): string {
    const pct = this.getPercentRemaining();
    const color = pct <= 10 ? chalk.red : pct <= 20 ? chalk.yellow : chalk.green;
    return color(`${pct}% Context Left`) + chalk.dim(` (${this.tokensUsed}/${this.maxTokens} tokens, ${this.totalMessages} msgs)`);
  }

  reset(): void {
    this.tokensUsed = 0;
    this.totalMessages = 0;
  }
}
