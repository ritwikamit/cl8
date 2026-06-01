import chalk from 'chalk';
import { renderLogo } from './pixel-logo.js';
import { StatusBar, StatusBarData } from './status-bar.js';
import { ThemeManager } from './theme-manager.js';

const TIPS = [
  'Ask questions, edit files, or run commands.',
  'Use @files to reference code in your workspace.',
  'Use /help for available commands.',
];

export async function showSplash(
  theme: ThemeManager,
  config: { ai: { defaultProvider: string }; workspace: { root: string } }
): Promise<void> {
  const columns = process.stdout.columns || 100;
  const c = theme.chalkColors;

  console.log();
  console.log(renderLogo(columns));
  console.log();

  console.log(chalk.dim(`  ${'─'.repeat(Math.min(columns - 4, 40))}`));
  console.log();

  for (const tip of TIPS) {
    console.log(`  ${chalk.dim('▎')} ${chalk.dim(tip)}`);
  }
  console.log();

  const steps = ['Initializing', 'Loading Agents', 'Loading Memory'];
  for (const step of steps) {
    console.log(`  ${chalk.dim('▎')} ${chalk.dim(step)}…`);
  }
  console.log(`  ${c.accent('▎')} ${chalk.bold('Ready')}`);
  console.log();

  console.log(chalk.dim(`  ${'─'.repeat(Math.min(columns - 4, 40))}`));
  console.log();

  const statusData: StatusBarData = {
    workspace: config.workspace.root,
    model: getModelName(config),
    contextPercent: 98,
    provider: config.ai.defaultProvider,
  };
  const statusBar = new StatusBar(theme);
  statusBar.render(statusData);
}

export async function showReducedSplash(
  theme: ThemeManager,
  config: { ai: { defaultProvider: string }; workspace: { root: string } }
): Promise<void> {
  const c = theme.chalkColors;
  const columns = process.stdout.columns || 100;

  console.log();
  console.log(renderLogo(columns));
  console.log();
  console.log(`  ${c.accent('▎')} ${chalk.bold('Ready')}\n`);

  console.log(chalk.dim(`  ${'─'.repeat(Math.min(columns - 4, 40))}`));
  console.log();

  const statusData: StatusBarData = {
    workspace: config.workspace.root,
    model: getModelName(config),
    contextPercent: 98,
    provider: config.ai.defaultProvider,
  };
  const statusBar = new StatusBar(theme);
  statusBar.render(statusData);
}

function getModelName(config: { ai: { defaultProvider: string } }): string {
  switch (config.ai.defaultProvider) {
    case 'openai': return 'GPT-4o';
    case 'gemini': return 'Gemini 2.0 Flash';
    case 'ollama': return 'Gemma 4';
    default: return 'unknown';
  }
}
