import chalk from 'chalk';
import { renderLogo } from './pixel-logo.js';
import { StatusBar, StatusBarData } from './status-bar.js';
import { ThemeManager } from './theme-manager.js';

const TIPS = [
  'Ask questions, edit files, or run commands.',
  'Use @files to reference code in your workspace.',
  'Use /help for available commands.',
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function showSplash(
  theme: ThemeManager,
  config: { ai: { defaultProvider: string }; workspace: { root: string } }
): Promise<void> {
  const columns = process.stdout.columns || 100;

  console.log();
  console.log(renderLogo(columns));
  console.log();
  console.log(`  ${chalk.dim('Tips:')}`);
  for (let i = 0; i < TIPS.length; i++) {
    await delay(80);
    console.log(`   ${chalk.dim(`${i + 1}.`)} ${chalk.dim(TIPS[i])}`);
  }
  console.log();

  const steps = ['Initializing', 'Loading Agents', 'Loading Memory'];
  for (const step of steps) {
    process.stdout.write(`  ● ${chalk.dim(step)}…\n`);
    await delay(300);
  }
  process.stdout.write(`  ● ${chalk.green('Ready')}\n`);
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
  console.log();
  console.log(renderLogo(process.stdout.columns || 100));
  console.log();
  console.log(`  ${chalk.green('●')} Ready\n`);

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
