import fs from 'node:fs/promises';
import path from 'node:path';
import { BaseTool } from './BaseTool.js';
import { ToolInput, ToolOutput, ToolContext } from '../types/tool.js';

interface SearchResult {
  file: string;
  line: number;
  content: string;
  match: string;
}

export class SearchTool extends BaseTool {
  constructor() {
    super({
      name: 'search',
      description: 'Search for files and content patterns in the workspace',
      category: 'search',
      permissions: ['read'],
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Search pattern (regex)' },
          include: { type: 'string', description: 'File pattern to include (e.g., "*.ts")' },
          path: { type: 'string', description: 'Directory to search in' },
          maxResults: { type: 'number', description: 'Maximum results to return' },
        },
        required: ['pattern'],
      },
      requiresApproval: false,
      dangerous: false,
    });
  }

  async execute(input: ToolInput, context: ToolContext): Promise<ToolOutput> {
    const pattern = input.pattern as string;
    const maxResults = (input.maxResults as number) || 50;
    const searchPath = input.path
      ? path.resolve(context.workspace, input.path as string)
      : context.workspace;

    const includePattern = input.include as string;

    try {
      const regex = new RegExp(pattern, 'gi');
      const results: SearchResult[] = [];

      await this.searchDirectory(searchPath, regex, includePattern, results, maxResults);

      return {
        success: true,
        data: { results, total: results.length, pattern },
        stdout: this.formatResults(results),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof SyntaxError) {
        return { success: false, error: `Invalid regex pattern: ${pattern}` };
      }
      return { success: false, error: message };
    }
  }

  private async searchDirectory(
    dir: string,
    regex: RegExp,
    includePattern: string | undefined,
    results: SearchResult[],
    maxResults: number
  ): Promise<void> {
    if (results.length >= maxResults) return;

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxResults) break;
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'node_modules') continue;
      if (entry.name === '.git') continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.searchDirectory(fullPath, regex, includePattern, results, maxResults);
      } else if (entry.isFile()) {
        if (includePattern && !this.matchGlob(entry.name, includePattern)) continue;

        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            if (results.length >= maxResults) break;
            const match = lines[i].match(regex);
            if (match) {
              results.push({
                file: fullPath,
                line: i + 1,
                content: lines[i].trim(),
                match: match[0],
              });
            }
          }
        } catch {
          continue;
        }
      }
    }
  }

  private matchGlob(filename: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(filename);
  }

  private formatResults(results: SearchResult[]): string {
    if (results.length === 0) return 'No results found.';

    const lines = results.map(
      r => `${r.file}:${r.line}: ${r.content}`
    );

    return lines.join('\n');
  }
}
