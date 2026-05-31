export class TypingAnimation {
  private reducedMotion: boolean;

  constructor(reducedMotion = false) {
    this.reducedMotion = reducedMotion;
  }

  private delay(ms: number): Promise<void> {
    if (this.reducedMotion) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async typeText(text: string, perChar = 30): Promise<void> {
    if (this.reducedMotion) {
      process.stdout.write(text);
      return;
    }

    for (const char of text) {
      process.stdout.write(char);
      await this.delay(perChar + Math.random() * 10);
    }
  }

  async typeLine(text: string, perChar = 30): Promise<void> {
    await this.typeText(text, perChar);
    process.stdout.write('\n');
  }

  async typeLines(lines: string[], perChar = 25, lineDelay = 80): Promise<void> {
    for (const line of lines) {
      await this.typeLine(line, perChar);
      await this.delay(lineDelay);
    }
  }
}
