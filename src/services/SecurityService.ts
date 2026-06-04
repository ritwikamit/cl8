import path from 'node:path';
import readline from 'node:readline';
import { SecurityConfig, ApprovalMode } from '../types/config.js';
import { ToolDefinition } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';

export class SecurityService {
  private config: SecurityConfig;
  private logger = getLogger();

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  isCommandAllowed(command: string): boolean {
    const normalized = command.toLowerCase().trim();

    for (const blocked of this.config.blockedCommands) {
      if (normalized.includes(blocked.toLowerCase())) {
        this.logger.warn(`Blocked command detected`, { command, blocked });
        return false;
      }
    }

    return true;
  }

  isPathAllowed(targetPath: string, allowedPaths: string[]): boolean {
    const resolved = path.resolve(targetPath);

    for (const allowed of allowedPaths) {
      const resolvedAllowed = path.resolve(allowed);
      if (resolved.startsWith(resolvedAllowed)) {
        return true;
      }
    }

    this.logger.warn(`Path access denied`, { path: targetPath });
    return false;
  }

  requiresApproval(tool: ToolDefinition): boolean {
    if (this.config.approvalMode === 'deny') {
      return true;
    }
    if (this.config.approvalMode === 'auto') {
      return false;
    }
    return tool.requiresApproval || tool.dangerous;
  }

  getApprovalMode(): ApprovalMode {
    return this.config.approvalMode;
  }

  setApprovalMode(mode: ApprovalMode): void {
    this.config.approvalMode = mode;
  }

  async requestApproval(toolName: string, input: Record<string, unknown>): Promise<boolean> {
    this.logger.info(`Approval requested for tool`, { tool: toolName, input });

    try {
      process.stderr.write('\x07'); // beep
      process.stderr.write('\n');
      const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
      const answer = await new Promise<string>(resolve => {
        rl.question(`  Allow ${toolName}${input.command ? ' ' + input.command : ''}? (y/N) `, resolve);
      });
      rl.close();
      return answer.trim().toLowerCase() === 'y';
    } catch {
      return false;
    }
  }

  validateFileSize(size: number): boolean {
    return size <= this.config.maxFileSize;
  }
}
