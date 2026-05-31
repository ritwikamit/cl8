import chalk from 'chalk';
import { selectLogoVariant, buildLogoFrames, renderLogo, LogoVariant } from './pixel-logo.js';
import { StatusBar, StatusBarData } from './status-bar.js';
import { ThemeManager } from './theme-manager.js';

const TIPS = [
  'Ask questions, edit files, or run commands.',
  'Use @files to reference code in your workspace.',
  'Use /help for available commands.',
  'Type naturally to describe what you want to build.',
  'Multi-line input: end a line with \\ to continue.',
  'Press Ctrl+C to cancel, Ctrl+D to exit.',
];

const INIT_STEPS = [
  'Initializing CL8…',
  'Loading Agents…',
  'Loading Memory…',
  'Ready',
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

export async function showSplash(
  theme: ThemeManager,
  config: { ai: { defaultProvider: string }; workspace: { root: string } }
): Promise<void> {
  const columns = process.stdout.columns || 100;
  const variant = selectLogoVariant(columns);
  const withDeco = columns >= 90;

  hideCursor();
  process.stdout.write('\x1b[2J\x1b[H');

  await animateLogo(variant, columns);

  console.log();
  console.log(`  ${chalk.dim('Tips for getting started:')}\n`);
  for (let i = 0; i < 3; i++) {
    await delay(80);
    process.stdout.write(`  ${chalk.dim(`${i + 1}.`)} ${chalk.dim(TIPS[i])}\n`);
  }
  console.log();

  for (const step of INIT_STEPS) {
    process.stdout.write(`  ● ${chalk.dim(step)}\n`);
    await delay(350);
  }

  process.stdout.write('\x1b[1A\x1b[2K');
  process.stdout.write(`  ● ${chalk.green('Ready')}\n`);
  console.log();

  const finalLogo = renderLogo(variant, columns, withDeco);
  process.stdout.write('\x1b[H' + finalLogo + '\n');

  const statusData: StatusBarData = {
    workspace: config.workspace.root,
    model: getModelName(config),
    contextPercent: 98,
    provider: config.ai.defaultProvider,
  };
  const statusBar = new StatusBar(theme);
  statusBar.render(statusData);

  showCursor();
}

export async function showReducedSplash(
  theme: ThemeManager,
  config: { ai: { defaultProvider: string }; workspace: { root: string } }
): Promise<void> {
  const columns = process.stdout.columns || 100;
  const variant = selectLogoVariant(columns);
  const withDeco = columns >= 90;
  const logo = renderLogo(variant, columns, withDeco);

  console.log(logo);
  console.log();
  console.log(`  ${chalk.dim('Tips for getting started:')}\n`);
  TIPS.slice(0, 3).forEach((tip, i) => {
    console.log(`  ${chalk.dim(`${i + 1}.`)} ${chalk.dim(tip)}`);
  });
  console.log();
  console.log(`  ${chalk.green('●')} Initializing CL8`);
  console.log(`  ${chalk.green('●')} Loading Agents`);
  console.log(`  ${chalk.green('●')} Loading Memory`);
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

async function animateLogo(variant: LogoVariant, columns: number): Promise<void> {
  const buildSteps = 10;
  const frameDelay = 60;

  const frames = buildLogoFrames(variant, columns, buildSteps);

  for (let i = 0; i < buildSteps + 3; i++) {
    process.stdout.write('\x1b[H');
    if (i < buildSteps) {
      process.stdout.write(frames[i]);
    } else {
      const logo = renderLogo(variant, columns, false);
      process.stdout.write(logo);
    }
    await delay(frameDelay);
  }
}

function getModelName(config: { ai: { defaultProvider: string } }): string {
  switch (config.ai.defaultProvider) {
    case 'openai': return 'GPT-4o';
    case 'gemini': return 'Gemini 2.0 Flash';
    case 'ollama': return 'Gemma 4';
    default: return 'unknown';
  }
}
