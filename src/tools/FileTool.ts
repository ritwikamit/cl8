import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'child_process';
import { BaseTool } from './BaseTool.js';
import { ToolInput, ToolOutput, ToolContext } from '../types/tool.js';

type FileOperation = 'read' | 'write' | 'edit' | 'delete' | 'list' | 'info';

export class FileTool extends BaseTool {
  constructor() {
    super({
      name: 'file',
      description: 'Read, write, edit, and manage files in the workspace',
      category: 'file',
      permissions: ['read', 'write'],
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['read', 'write', 'edit', 'delete', 'list', 'info'],
          },
          path: { type: 'string', description: 'File path relative to workspace' },
          content: { type: 'string', description: 'Content to write (for write/edit)' },
          oldString: { type: 'string', description: 'Text to replace (for edit)' },
          newString: { type: 'string', description: 'Replacement text (for edit)' },
          pattern: { type: 'string', description: 'Glob pattern (for list)' },
        },
        required: ['operation', 'path'],
      },
      requiresApproval: false,
      dangerous: false,
    });
  }

  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    let operation = input.operation as string | undefined;
    let filePath = input.path as string | undefined;

    if (!filePath && input.description) {
      const desc = input.description as string;
      const backtickMatch = desc.match(/`([^`]+\.\w+)`/);
      if (backtickMatch) {
        filePath = backtickMatch[1].replace(/[^a-zA-Z0-9_\-\.\/\\]/g, '');
      }
      if (!filePath) {
        const words = desc.toLowerCase().split(/\s+/);
        const namedWord = words.find(w => w.endsWith('.py') || w.endsWith('.js') || w.endsWith('.ts') || w.endsWith('.txt') || w.endsWith('.json') || w.endsWith('.html') || w.endsWith('.css') || w.endsWith('.md'));
        if (namedWord) {
          filePath = namedWord.replace(/[^a-zA-Z0-9_\-\.\/\\]/g, '');
        }
      }
      if (!filePath && input.content && typeof input.content === 'string') {
        if (input.content.includes('import cv2') || input.content.includes('import opencv')) {
          filePath = 'script.py';
        } else if (input.content.includes('import') || input.content.includes('def ') || input.content.includes('class ')) {
          filePath = 'script.py';
        } else if (input.content.includes('<!DOCTYPE html>') || input.content.includes('<html')) {
          filePath = 'index.html';
        } else if (input.content.includes('{') && input.content.includes('}') && (input.content.includes('"name"') || input.content.includes('"version"'))) {
          filePath = 'package.json';
        } else {
          filePath = 'output.txt';
        }
      }
    }

    if (!operation && filePath && input.content) {
      operation = 'write';
    } else if (!operation && filePath && !input.content) {
      operation = 'read';
    }

    if (!filePath) {
      return { success: false, error: 'Missing required field: path' };
    }
    if (!context.workspace) {
      return { success: false, error: 'No workspace configured' };
    }

    const safePath = this.resolveSafePath(filePath, context.workspace);

    try {
      switch (operation) {
        case 'read':
          return await this.readFile(safePath);
        case 'write':
          return await this.writeFile(safePath, input.content as string);
        case 'edit':
          return await this.editFile(safePath, input.oldString as string, input.newString as string);
        case 'delete':
          return await this.deleteFile(safePath);
        case 'list':
          return await this.listFiles(safePath, input.pattern as string);
        case 'info':
          return await this.fileInfo(safePath);
        default:
          return { success: false, error: `Unknown operation: ${operation}. Use write, read, edit, delete, list, or info.` };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  private resolveSafePath(filePath: string, workspace: string): string {
    const resolved = path.resolve(workspace || '.', filePath);
    const normalizedWorkspace = path.resolve(workspace || '.');

    if (!resolved.startsWith(normalizedWorkspace)) {
      throw new Error(`Access denied: path ${filePath} is outside workspace`);
    }

    return resolved;
  }

  private async readFile(filePath: string): Promise<ToolOutput> {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      success: true,
      data: { content, path: filePath, size: content.length },
      stdout: content,
    };
  }

  private async writeFile(filePath: string, content: string): Promise<ToolOutput> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        try {
          const b64 = Buffer.from(content, 'utf-8').toString('base64');
          const psCmd = `[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64}')) | Set-Content '${filePath.replace(/'/g, "''")}' -Encoding UTF8`;
          execSync(`powershell -NoProfile -Command "${psCmd.replace(/"/g, '\\"')}"`, { timeout: 15000 });
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }
    return {
      success: true,
      data: { path: filePath, size: content.length },
      stdout: `Wrote ${filePath}`,
    };
  }

  private async editFile(filePath: string, oldString: string, newString: string): Promise<ToolOutput> {
    const content = await fs.readFile(filePath, 'utf-8');

    if (!content.includes(oldString)) {
      return { success: false, error: `String "${oldString}" not found in file` };
    }

    const newContent = content.replace(oldString, newString);
    await fs.writeFile(filePath, newContent, 'utf-8');

    return {
      success: true,
      data: { path: filePath, changes: 1 },
      stdout: `Edited ${filePath}`,
    };
  }

  private async deleteFile(filePath: string): Promise<ToolOutput> {
    await fs.unlink(filePath);
    return { success: true, stdout: `Deleted ${filePath}` };
  }

  private async listFiles(dirPath: string, _pattern?: string): Promise<ToolOutput> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, e.name),
    }));

    return { success: true, data: { files } };
  }

  private async fileInfo(filePath: string): Promise<ToolOutput> {
    const stats = await fs.stat(filePath);
    return {
      success: true,
      data: {
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
      },
    };
  }
}
