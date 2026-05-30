import { AgentMessage } from './agent.js';

export interface MemoryEntry {
  id: string;
  type: 'conversation' | 'session' | 'workspace' | 'vector';
  content: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  ttl?: number;
}

export interface ConversationMemory {
  sessionId: string;
  messages: AgentMessage[];
  summary?: string;
  tokenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionData {
  id: string;
  workspace: string;
  provider: string;
  model: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface MemoryQuery {
  type?: MemoryEntry['type'];
  limit?: number;
  offset?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface VectorMemoryEntry {
  id: string;
  vector: number[];
  content: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}
