import chalk from 'chalk';
import path from 'node:path';

export class WorkspacePanel {
  display(workspacePath: string): void {
    const home = process.env.USERPROFILE || process.env.HOME || '';
    let displayPath = workspacePath;

    if (home && displayPath.startsWith(home)) {
      displayPath = '~' + displayPath.slice(home.length);
    }

    const shortened = this.shortenPath(displayPath, 50);
    console.log(`  ${chalk.dim('📁')} ${chalk.dim(shortened)}`);
  }

  private shortenPath(p: string, maxLen: number): string {
    if (p.length <= maxLen) return p;
    const parts = p.replace(/\\/g, '/').split('/');
    if (parts.length <= 2) return '...' + p.slice(-maxLen + 3);
    const head = parts.slice(0, 1);
    const tail = parts.slice(-2);
    return `${head}/.../${tail.join('/')}`;
  }
}
