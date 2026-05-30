import fs from 'node:fs/promises';
import path from 'node:path';
import { AgentMessage } from '../types/agent.js';
import { ConversationMemory as ConversationMemoryType } from '../types/memory.js';
import { generateId } from '../utils/crypto.js';
import { getLogger } from '../utils/logger.js';
import { createLogger } from 'winston';

export class ConversationMemory {
  private sessions: Map<string, ConversationMemoryType> = new Map();
  private storageDir: string;
  private logger = getLogger();
  private maxTokens: number;

  constructor(storageDir: string, maxTokens: number = 128000) {
    this.storageDir = path.resolve(storageDir, 'conversations');
    this.maxTokens = maxTokens;
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.storageDir, { recursive: true });
    await this.loadSessions();
  }

  async createSession(sessionId: string): Promise<ConversationMemoryType> {
    const session: ConversationMemoryType = {
      sessionId,
      messages: [],
      tokenCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    await this.persistSession(session);
    return session;
  }

  async addMessage(sessionId: string, message: AgentMessage): Promise<void> {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = await this.createSession(sessionId);
    }

    session.messages.push(message);
    session.tokenCount += Math.ceil(message.content.length / 4);
    session.updatedAt = new Date();

    if (this.shouldCompact(session)) {
      await this.compactSession(session);
    }

    await this.persistSession(session);
  }

  getMessages(sessionId: string): AgentMessage[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  getSession(sessionId: string): ConversationMemoryType | undefined {
    return this.sessions.get(sessionId);
  }

  async getContext(sessionId: string, maxTokens: number): Promise<AgentMessage[]> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const messages: AgentMessage[] = [];
    let tokens = 0;

    for (const msg of session.messages) {
      const msgTokens = Math.ceil(msg.content.length / 4);
      if (tokens + msgTokens > maxTokens) break;
      messages.push(msg);
      tokens += msgTokens;
    }

    return messages;
  }

  async clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    const filePath = this.getSessionPath(sessionId);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }

  getAllSessions(): ConversationMemoryType[] {
    return Array.from(this.sessions.values());
  }

  private shouldCompact(session: ConversationMemoryType): boolean {
    return session.tokenCount > this.maxTokens * 0.75;
  }

  private async compactSession(session: ConversationMemoryType): Promise<void> {
    const systemMessages = session.messages.filter(m => m.role === 'system');
    const recentMessages = session.messages.slice(-50);

    const summary = await this.generateSummary(session.messages);
    session.summary = summary;
    session.messages = [...systemMessages, ...recentMessages];
    session.tokenCount = session.messages.reduce(
      (acc, m) => acc + Math.ceil(m.content.length / 4), 0
    );

    this.logger.info(`Session ${session.sessionId} compacted. Summary: ${summary.slice(0, 100)}...`);
  }

  private async generateSummary(messages: AgentMessage[]): Promise<string> {
    const keyPoints = messages
      .filter(m => m.role !== 'system')
      .slice(-20)
      .map(m => `${m.role}: ${m.content.slice(0, 200)}`)
      .join('\n');

    return `Conversation with ${messages.length} messages. Recent topics: ${keyPoints.slice(0, 500)}`;
  }

  private async loadSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const content = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
          const session = JSON.parse(content) as ConversationMemoryType;
          session.createdAt = new Date(session.createdAt);
          session.updatedAt = new Date(session.updatedAt);
          this.sessions.set(session.sessionId, session);
        } catch (err) {
          this.logger.warn(`Failed to load session ${file}`);
        }
      }
    } catch {
      // directory doesn't exist yet
    }
  }

  private async persistSession(session: ConversationMemoryType): Promise<void> {
    const filePath = this.getSessionPath(session.sessionId);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.storageDir, `${sessionId}.json`);
  }
}
