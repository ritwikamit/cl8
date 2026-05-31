import gradient from 'gradient-string';
import chalk from 'chalk';

const LOGO_LINES = [
  ' ██████   ██        ██████ ',
  '██        ██       ██    ██',
  '██        ██       ████████',
  '██        ██       ██    ██',
  ' ██████   ████████  ██████ ',
];

const WIDTH = 26;
const HEIGHT = 5;

const GRADIENT = gradient(['#00AAFF', '#9333EA', '#FF6BCB']);

export function renderLogo(columns: number): string {
  const pad = Math.max(0, Math.floor((columns - WIDTH) / 2));
  const prefix = ' '.repeat(pad);

  const lines: string[] = [];
  lines.push(prefix + chalk.dim('┌' + '─'.repeat(WIDTH - 2) + '┐'));

  for (const line of LOGO_LINES) {
    const trimmed = line.trimEnd();
    const colored = trimmed ? GRADIENT(trimmed) : trimmed;
    lines.push(prefix + chalk.dim('│') + ' ' + colored + ' ' + chalk.dim('│'));
  }

  lines.push(prefix + chalk.dim('└' + '─'.repeat(WIDTH - 2) + '┘'));
  return lines.join('\n');
}
