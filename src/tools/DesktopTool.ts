import { exec } from 'child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { BaseTool } from './BaseTool.js';
import { ToolInput, ToolOutput, ToolContext } from '../types/tool.js';

const execAsync = promisify(exec);

export class DesktopTool extends BaseTool {
  constructor() {
    super({
      name: 'desktop',
      description: 'Open URLs in the default browser and launch desktop applications',
      category: 'utility',
      permissions: ['execute'],
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['open_url', 'launch_app'],
            description: 'Action to perform: open a URL or launch an app',
          },
          target: {
            type: 'string',
            description: 'URL to open (e.g. https://google.com) or app name/path to launch',
          },
        },
        required: ['action', 'target'],
      },
      requiresApproval: false,
      dangerous: false,
    });
  }

  async execute(input: ToolInput, _context: ToolContext): Promise<ToolOutput> {
    const action = input.action as string;
    let target = input.target as string;

    if (!target && action === 'launch_app' && input.description) {
      const desc = (input.description as string).toLowerCase();
      const appMatch = desc.match(/(?:launch|open|start|run)\s+(.+)/i);
      target = appMatch ? appMatch[1].trim() : desc;
    }

    if (!target) {
      const desc = input.description ? ` (from: ${input.description})` : '';
      return { success: false, error: `Missing target. Usage: {"action":"${action || 'launch_app'}","target":"app_name"}${desc}` };
    }

    try {
      if (action === 'open_url') {
        return await this.openUrl(target);
      } else if (action === 'launch_app') {
        return await this.launchApp(target);
      } else {
        return { success: false, error: `Unknown action: ${action}` };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  private async openUrl(url: string): Promise<ToolOutput> {
    const fullUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;

    const platform = process.platform;
    let command: string;

    if (platform === 'win32') {
      command = `start "" "${fullUrl}"`;
    } else if (platform === 'darwin') {
      command = `open "${fullUrl}"`;
    } else {
      command = `xdg-open "${fullUrl}"`;
    }

    await execAsync(command);
    return { success: true, stdout: `Opened ${fullUrl} in the default browser` };
  }

  private async launchApp(appName: string): Promise<ToolOutput> {
    const platform = process.platform;
    let command: string;
    const hasPath = appName.includes(path.sep) || appName.includes('/');
    const isExe = appName.endsWith('.exe');

    if (platform === 'win32') {
      if (hasPath || isExe) {
        command = `start "" "${appName}"`;
      } else {
        command = `start "" ${appName}`;
      }
    } else if (platform === 'darwin') {
      command = `open -a "${appName}"`;
    } else {
      command = appName;
    }

    await execAsync(command);
    return { success: true, stdout: `Launched ${appName}` };
  }
}
