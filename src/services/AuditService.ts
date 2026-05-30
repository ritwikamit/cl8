import fs from 'node:fs/promises';
import path from 'node:path';
import { ToolCall, ToolResult } from '../types/tool.js';
import { AgentMessage } from '../types/agent.js';
import { getLogger } from '../utils/logger.js';

interface AuditEntry {
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
}

export class AuditService {
  private logPath: string;
  private entries: AuditEntry[] = [];
  private logger = getLogger();
  private maxEntries: number;

  constructor(logPath: string, maxEntries: number = 1000) {
    this.logPath = path.resolve(logPath, 'audit.log');
    this.maxEntries = maxEntries;
  }

  logToolCall(call: ToolCall, result: ToolResult): void {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      type: 'tool_call',
      data: {
        toolCallId: call.id,
        tool: call.name,
        input: call.input,
        success: result.output.success,
        duration: result.duration,
        error: result.output.error,
      },
    };

    this.addEntry(entry);
  }

  logMessage(msg: AgentMessage): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      type: 'message',
      data: {
        role: msg.role,
        id: msg.id,
        contentLength: msg.content.length,
      },
    });
  }

  logEvent(type: string, data: Record<string, unknown>): void {
    this.addEntry({ timestamp: new Date().toISOString(), type, data });
  }

  private addEntry(entry: AuditEntry): void {
    this.entries.push(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    this.logger.debug(`Audit: ${entry.type}`, entry.data);
  }

  async flush(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.logPath), { recursive: true });
      const content = this.entries.map(e => JSON.stringify(e)).join('\n');
      await fs.appendFile(this.logPath, content + '\n', 'utf-8');
    } catch (err) {
      this.logger.error('Failed to flush audit log', { error: err });
    }
  }

  getRecent(count: number = 10): AuditEntry[] {
    return this.entries.slice(-count);
  }

  clear(): void {
    this.entries = [];
  }
}
