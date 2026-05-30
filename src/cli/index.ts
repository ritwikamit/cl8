import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { createLogger } from '../utils/logger.js';
import { loadConfig } from '../config/index.js';
import { chatCommand } from './commands/chat.js';
import { initCommand } from './commands/init.js';
import { sessionCommand } from './commands/session.js';
import { configCommand } from './commands/config.js';

function showBanner(): void {
  const text = figlet.textSync('CL8', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
  });
  console.log(gradient.pastel.multiline(text));
  console.log(chalk.cyan('  Terminal AI Coding & Automation Assistant\n'));
  console.log(chalk.dim('  Version 0.1.0 · Type /help for commands\n'));
}

export function createCLI(): Command {
  const config = loadConfig();
  createLogger(config.logging.level);

  const program = new Command();

  program
    .name('cl8')
    .description('Terminal AI Coding & Automation Assistant')
    .version('0.1.0')
    .addHelpText('beforeAll', () => { showBanner(); return ''; });

  program
    .command('chat', { isDefault: true })
    .description('Start an interactive chat session')
    .option('-p, --provider <provider>', 'AI provider (openai, gemini, ollama)')
    .option('-m, --model <model>', 'Model name')
    .option('-w, --workspace <path>', 'Workspace directory')
    .option('-s, --session <id>', 'Resume session')
    .action(async (options) => {
      await chatCommand(options);
    });

  program
    .command('init')
    .description('Initialize CL8 configuration')
    .action(async () => {
      await initCommand();
    });

  program
    .command('session')
    .description('Manage sessions')
    .option('-l, --list', 'List recent sessions')
    .option('-s, --show <id>', 'Show session details')
    .option('-r, --resume <id>', 'Resume a session')
    .action(async (options) => {
      await sessionCommand(options);
    });

  program
    .command('config')
    .description('Manage configuration')
    .option('-s, --show', 'Show configuration')
    .option('--set <key>', 'Set a config value')
    .option('--value <val>', 'Value to set')
    .option('--reset', 'Reset to defaults')
    .option('--path', 'Show config file path')
    .action(async (options) => {
      await configCommand(options);
    });

  program
    .command('doctor')
    .description('Check system health')
    .action(async () => {
      console.log(chalk.cyan('\n  🏥 CL8 Health Check\n'));
      await checkHealth();
    });

  program
    .command('version')
    .description('Show version')
    .action(() => {
      console.log('0.1.0');
    });

  return program;
}

async function checkHealth(): Promise<void> {
  const checks = [
    { name: 'Node.js version', pass: process.version >= 'v18.0.0', detail: process.version },
    { name: 'Platform', pass: true, detail: process.platform },
    { name: 'Configuration', pass: true, detail: 'Present' },
  ];

  const config = loadConfig();
  checks.push({
    name: `${config.ai.defaultProvider} API key`,
    pass: !!(
      (config.ai.defaultProvider === 'openai' && config.ai.openai?.apiKey) ||
      (config.ai.defaultProvider === 'gemini' && config.ai.gemini?.apiKey) ||
      config.ai.defaultProvider === 'ollama'
    ),
    detail: config.ai.defaultProvider === 'ollama' ? 'Local only' : 'Configured',
  });

  let allPass = true;
  for (const check of checks) {
    const icon = check.pass ? chalk.green('✓') : chalk.red('✖');
    if (!check.pass) allPass = false;
    console.log(`  ${icon} ${check.name}: ${chalk.dim(check.detail)}`);
  }

  console.log(allPass
    ? chalk.green('\n  ✅ All checks passed!\n')
    : chalk.yellow('\n  ⚠ Some checks failed. Run `cl8 init` to configure.\n')
  );
}
