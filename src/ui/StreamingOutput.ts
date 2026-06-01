import { MarkdownRenderer } from './MarkdownRenderer.js';

export class StreamingOutput {
  private buffer: string = '';
  private markdown: MarkdownRenderer;
  private lastRender: string = '';
  private renderInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.markdown = new MarkdownRenderer();
  }

  start(): void {
    this.buffer = '';
    this.lastRender = '';

    this.renderInterval = setInterval(() => {
      this.flushBuffer();
    }, 100);
  }

  append(chunk: string): void {
    process.stdout.write(chunk);
    this.buffer += chunk;
  }

  appendFormatted(chunk: string): void {
    this.buffer += chunk;
  }

  private flushBuffer(): void {
    if (this.buffer === this.lastRender) return;
    this.lastRender = this.buffer;
  }

  stop(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }
    this.flushBuffer();
  }

  clear(): void {
    this.buffer = '';
    this.lastRender = '';
  }

  getContent(): string {
    return this.buffer;
  }
}
