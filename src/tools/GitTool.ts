import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { BaseTool } from './BaseTool.js';
import { ToolInput, ToolOutput, ToolContext } from '../types/tool.js';

const execAsync = promisify(exec);

type GitAction = 'status' | 'diff' | 'log' | 'commit' | 'add' | 'branch' | 'checkout' | 'blame' | 'stash' | 'push' | 'pull' | 'init' | 'clone' | 'remote';

export class GitTool extends BaseTool {
  constructor() {
    super({
      name: 'git',
      description: 'Git version control operations: status, diff, log, commit, add, branch, checkout, blame, stash, push, pull, init, clone, remote',
      category: 'utility',
      permissions: ['read', 'write', 'execute'],
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['status', 'diff', 'log', 'commit', 'add', 'branch', 'checkout', 'blame', 'stash', 'push', 'pull', 'init', 'clone', 'remote'], description: 'Git action to perform' },
          path: { type: 'string', description: 'Repository path (default: workspace root)' },
          message: { type: 'string', description: 'Commit message' },
          file: { type: 'string', description: 'File path for blame, add, diff' },
          branch: { type: 'string', description: 'Branch name for checkout, branch' },
          maxCount: { type: 'number', description: 'Max log entries (default: 10)' },
          args: { type: 'string', description: 'Extra arguments' },
          url: { type: 'string', description: 'Remote URL for clone/remote' },
          name: { type: 'string', description: 'Remote name (default: origin)' },
        },
        required: ['action'],
      },
      requiresApproval: true,
      dangerous: true,
    });
  }

  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const action = input.action as GitAction;
    const repoPath = (input.path as string) || context.workspace || '.';
    const resolvedPath = path.resolve(repoPath);

    try {
      switch (action) {
        case 'status': {
          const { stdout, stderr } = await execAsync('git status', { cwd: resolvedPath });
          return { success: true, stdout: stdout, stderr };
        }
        case 'diff': {
          const fileArg = input.file ? ` -- "${input.file}"` : '';
          const extra = input.args ? ` ${input.args}` : '';
          const { stdout, stderr } = await execAsync(`git diff${extra}${fileArg}`, { cwd: resolvedPath, maxBuffer: 10 * 1024 * 1024 });
          return { success: true, stdout: stdout || '(no changes)', stderr };
        }
        case 'log': {
          const maxCount = input.maxCount || 10;
          const extra = input.args || '';
          const { stdout, stderr } = await execAsync(`git log --oneline --decorate -${maxCount} ${extra}`, { cwd: resolvedPath });
          const entries = stdout.trim() ? stdout.split('\n') : [];
          return { success: true, stdout: stdout, data: { entries }, stderr };
        }
        case 'commit': {
          const msg = (input.message as string) || 'Update';
          const { stdout, stderr } = await execAsync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: resolvedPath });
          return { success: true, stdout, stderr };
        }
        case 'add': {
          const target = input.file || input.args || '.';
          const { stdout, stderr } = await execAsync(`git add ${target}`, { cwd: resolvedPath });
          return { success: true, stdout: stdout || `Added ${target}`, stderr };
        }
        case 'branch': {
          const extra = input.args || '';
          const { stdout, stderr } = await execAsync(`git branch ${extra}`, { cwd: resolvedPath });
          const branches = stdout.trim() ? stdout.split('\n').map(b => b.trim()) : [];
          return { success: true, stdout, data: { branches }, stderr };
        }
        case 'checkout': {
          const target = input.branch || input.args || 'main';
          const { stdout, stderr } = await execAsync(`git checkout ${target}`, { cwd: resolvedPath });
          return { success: true, stdout, stderr };
        }
        case 'blame': {
          const file = input.file as string;
          if (!file) return { success: false, error: 'Missing required field: file for blame' };
          const extra = input.args || '';
          const { stdout, stderr } = await execAsync(`git blame ${extra} -- "${file}"`, { cwd: resolvedPath, maxBuffer: 10 * 1024 * 1024 });
          return { success: true, stdout, stderr };
        }
        case 'stash': {
          const extra = input.args || 'push';
          const { stdout, stderr } = await execAsync(`git stash ${extra}`, { cwd: resolvedPath });
          return { success: true, stdout, stderr };
        }
        case 'push': {
          const remote = input.name || 'origin';
          const branch = input.branch || '';
          const { stdout, stderr } = await execAsync(`git push ${remote} ${branch}`, { cwd: resolvedPath });
          return { success: true, stdout, stderr };
        }
        case 'pull': {
          const remote = input.name || 'origin';
          const branch = input.branch || '';
          const { stdout, stderr } = await execAsync(`git pull ${remote} ${branch}`, { cwd: resolvedPath });
          return { success: true, stdout, stderr };
        }
        case 'init': {
          const { stdout, stderr } = await execAsync('git init', { cwd: resolvedPath });
          return { success: true, stdout: `Initialized empty Git repository in ${resolvedPath}`, stderr };
        }
        case 'clone': {
          const url = input.url as string;
          if (!url) return { success: false, error: 'Missing required field: url for clone' };
          const dir = input.args || '';
          const { stdout, stderr } = await execAsync(`git clone ${url} ${dir}`, { cwd: resolvedPath, timeout: 120000 });
          return { success: true, stdout, stderr };
        }
        case 'remote': {
          const name = input.name || 'origin';
          const url = input.url as string;
          const extra = input.args || '';
          if (url) {
            const { stdout, stderr } = await execAsync(`git remote add ${name} ${url}`, { cwd: resolvedPath });
            return { success: true, stdout: `Added remote ${name}: ${url}`, stderr };
          }
          const { stdout, stderr } = await execAsync('git remote -v', { cwd: resolvedPath });
          return { success: true, stdout, stderr };
        }
        default:
          return { success: false, error: `Unknown git action: ${action}` };
      }
    } catch (err: any) {
      return {
        success: false,
        stdout: err.stdout || '',
        stderr: err.stderr || '',
        error: err.stderr || err.message,
      };
    }
  }
}
