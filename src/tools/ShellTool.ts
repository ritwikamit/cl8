import { exec } from 'child_process';
import { promisify } from 'node:util';
import { BaseTool } from './BaseTool.js';
import { ToolInput, ToolOutput, ToolContext } from '../types/tool.js';

const execAsync = promisify(exec);

const BLOCKED_COMMANDS = [
  'rm -rf /', 'rmdir /s /', 'format', 'del /f /s',
  ':(){ :|:& };:', 'dd if=', 'mkfs', 'shutdown', 'reboot',
  'chmod 777', 'sudo rm', 'rd /s /q',
];

export class ShellTool extends BaseTool {
  constructor() {
    super({
      name: 'shell',
      description: 'Execute shell commands in the workspace environment',
      category: 'shell',
      permissions: ['execute'],
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command to execute' },
          timeout: { type: 'number', description: 'Timeout in milliseconds' },
          workdir: { type: 'string', description: 'Working directory for command' },
        },
        required: ['command'],
      },
      requiresApproval: true,
      dangerous: true,
    });
  }

  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    let command = input.command as string;

    if (!command && input.description) {
      const desc = input.description as string;
      const backtickCmd = desc.match(/`([^`]+)`/);
      if (backtickCmd) command = backtickCmd[1];
    }

    if (!command || command.trim().length === 0) {
      return { success: false, error: 'No command provided' };
    }

    if (!this.isCommandAllowed(command)) {
      return {
        success: false,
        error: `Command blocked for security reasons: ${command}`,
      };
    }

    const timeout = (input.timeout as number) || 120000;
    const workdir = (input.workdir as string) || context.workspace || process.cwd();

    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command, {
        cwd: workdir,
        timeout,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          CL8_SESSION_ID: context.sessionId,
        },
        shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
      });
      const duration = Date.now() - startTime;

      return {
        success: true,
        stdout: stdout || '',
        stderr: stderr || '',
        data: { duration, exitCode: 0 },
      };
    } catch (err: any) {
      return {
        success: err.code === 0,
        stdout: err.stdout || '',
        stderr: err.stderr || '',
        exitCode: err.code || -1,
        error: (err.stderr || err.message || '').trim(),
      };
    }
  }

  private isCommandAllowed(command: string): boolean {
    const normalized = command.toLowerCase().trim();

    for (const blocked of BLOCKED_COMMANDS) {
      if (normalized.includes(blocked.toLowerCase())) {
        return false;
      }
    }

    return true;
  }
}
