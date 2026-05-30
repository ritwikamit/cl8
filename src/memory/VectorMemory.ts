import { VectorMemoryEntry } from '../types/memory.js';
import { generateId } from '../utils/crypto.js';
import { getLogger } from '../utils/logger.js';

export class VectorMemory {
  private entries: VectorMemoryEntry[] = [];
  private logger = getLogger();
  private dimension: number;

  constructor(dimension: number = 1536) {
    this.dimension = dimension;
  }

  async add(content: string, metadata: Record<string, unknown> = {}): Promise<string> {
    const id = generateId();
    const vector = await this.generateVector(content);

    const entry: VectorMemoryEntry = {
      id,
      vector,
      content,
      metadata,
      timestamp: new Date(),
    };

    this.entries.push(entry);
    return id;
  }

  async search(query: string, topK: number = 5): Promise<VectorMemoryEntry[]> {
    const queryVector = await this.generateVector(query);

    const scored = this.entries.map(entry => ({
      entry,
      score: this.cosineSimilarity(queryVector, entry.vector),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(s => s.entry);
  }

  remove(id: string): void {
    this.entries = this.entries.filter(e => e.id !== id);
  }

  clear(): void {
    this.entries = [];
  }

  count(): number {
    return this.entries.length;
  }

  private async generateVector(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const wordFreq = new Map<string, number>();

    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    const vector: number[] = new Array(this.dimension).fill(0);
    for (const [word, freq] of wordFreq) {
      const hash = this.hashString(word);
      const index = Math.abs(hash) % this.dimension;
      vector[index] += freq;
    }

    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }

    return vector;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }
}
