import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const HISTORY_FILE = path.resolve(os.homedir(), '.cl8_history');

export class CommandHistory {
  private history: string[] = [];
  private maxSize: number;
  private currentIndex = -1;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  async load(): Promise<void> {
    try {
      const content = await fs.readFile(HISTORY_FILE, 'utf-8');
      this.history = content.split('\n').filter(Boolean).slice(-this.maxSize);
    } catch {
      this.history = [];
    }
  }

  async add(command: string): Promise<void> {
    if (!command.trim()) return;
    this.history.push(command);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
    this.currentIndex = this.history.length;
    await this.persist();
  }

  getPrevious(): string | null {
    if (this.history.length === 0) return null;
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    return this.history[this.currentIndex] || null;
  }

  getNext(): string | null {
    if (this.currentIndex >= this.history.length - 1) {
      this.currentIndex = this.history.length;
      return null;
    }
    this.currentIndex = Math.min(this.history.length - 1, this.currentIndex + 1);
    return this.history[this.currentIndex] || null;
  }

  getAll(): string[] {
    return [...this.history];
  }

  search(pattern: string): string[] {
    return this.history.filter(cmd => cmd.includes(pattern));
  }

  private async persist(): Promise<void> {
    try {
      await fs.writeFile(HISTORY_FILE, this.history.join('\n'), 'utf-8');
    } catch {
      // fail silently for history persistence
    }
  }
}
