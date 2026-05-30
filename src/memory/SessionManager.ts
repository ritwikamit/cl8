import fs from 'node:fs/promises';
import path from 'node:path';
import { SessionData } from '../types/memory.js';
import { generateId } from '../utils/crypto.js';
import { getLogger } from '../utils/logger.js';

export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private storageDir: string;
  private logger = getLogger();
  private currentSessionId: string | null = null;

  constructor(storageDir: string) {
    this.storageDir = path.resolve(storageDir, 'sessions');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.storageDir, { recursive: true });
    await this.loadSessions();
  }

  createSession(workspace: string, provider: string, model: string): SessionData {
    const session: SessionData = {
      id: generateId(),
      workspace,
      provider,
      model,
      startTime: new Date(),
      messageCount: 0,
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
    };

    this.sessions.set(session.id, session);
    this.currentSessionId = session.id;
    this.persistSession(session);
    this.logger.info(`Session created: ${session.id}`);

    return session;
  }

  getSession(id: string): SessionData | undefined {
    return this.sessions.get(id);
  }

  getCurrentSession(): SessionData | undefined {
    if (!this.currentSessionId) return undefined;
    return this.sessions.get(this.currentSessionId);
  }

  setCurrentSession(id: string): boolean {
    if (!this.sessions.has(id)) return false;
    this.currentSessionId = id;
    return true;
  }

  async endSession(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) return;

    session.endTime = new Date();
    await this.persistSession(session);
    this.logger.info(`Session ended: ${id}`);
  }

  updateTokenUsage(prompt: number, completion: number): void {
    const session = this.getCurrentSession();
    if (!session) return;

    session.tokenUsage.prompt += prompt;
    session.tokenUsage.completion += completion;
    session.tokenUsage.total += prompt + completion;
    session.messageCount++;
  }

  listSessions(limit: number = 10): SessionData[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  private async loadSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const content = await fs.readFile(path.join(this.storageDir, file), 'utf-8');
          const session = JSON.parse(content) as SessionData;
          session.startTime = new Date(session.startTime);
          if (session.endTime) session.endTime = new Date(session.endTime);
          this.sessions.set(session.id, session);
        } catch {
          continue;
        }
      }
    } catch {
      // directory doesn't exist yet
    }
  }

  private async persistSession(session: SessionData): Promise<void> {
    const filePath = path.join(this.storageDir, `${session.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
  }
}
