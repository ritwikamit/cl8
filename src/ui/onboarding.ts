import chalk from 'chalk';
import { TypingAnimation } from './typing-animation.js';
import { ThemeManager } from './theme-manager.js';

export class Onboarding {
  private typing: TypingAnimation;
  private theme: ThemeManager;

  constructor(typing: TypingAnimation, theme: ThemeManager) {
    this.typing = typing;
    this.theme = theme;
  }

  async showWelcome(): Promise<void> {
    const c = this.theme.chalkColors;

    const border = chalk.cyan('╭' + '─'.repeat(36) + '╮');
    const separator = chalk.cyan('│') + '  ' + ' '.repeat(32) + chalk.cyan('│');

    console.log();
    console.log(` ${border}`);
    console.log(` ${separator}`);
    console.log(` ${chalk.cyan('│')}  ${c.primary.bold('Welcome to CL8')}${' '.repeat(15)}${chalk.cyan('│')}`);
    console.log(` ${chalk.cyan('│')}  ${c.secondary('Autonomous Coding Assistant')}${' '.repeat(4)}${chalk.cyan('│')}`);
    console.log(` ${separator}`);
    console.log(` ${chalk.cyan('│')}  ${c.dim('AI-powered development')}${' '.repeat(11)}${chalk.cyan('│')}`);
    console.log(` ${chalk.cyan('│')}  ${c.dim('terminal for modern teams')}${' '.repeat(11)}${chalk.cyan('│')}`);
    console.log(` ${separator}`);
    console.log(` ${chalk.cyan('╰' + '─'.repeat(36) + '╯')}`);
    console.log();

    await this.typing.typeLines([
      '  ✓ Configuration Loaded',
      '  ✓ Workspace Connected',
      '  ✓ Agent Initialized',
      '  ✓ Memory Ready',
    ], 20, 60);

    console.log();
  }
}
