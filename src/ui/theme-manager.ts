import { ThemeMode, ThemeColors, TerminalType } from './types.js';
import chalk from 'chalk';

export class ThemeManager {
  private mode: ThemeMode = 'auto';
  private terminalType: TerminalType = 'unknown';
  private isDark: boolean = true;

  constructor(mode: ThemeMode = 'auto') {
    this.mode = mode;
    this.detectTerminal();
    this.detectTheme();
  }

  private detectTerminal(): void {
    const term = process.env.TERM_PROGRAM || '';
    const os = process.platform;

    if (term.includes('vscode')) this.terminalType = 'linux';
    else if (term.includes('windows-terminal') || process.env.WT_SESSION) this.terminalType = 'windows-terminal';
    else if (os === 'win32') {
      this.terminalType = process.env.PSModulePath ? 'powershell' : 'cmd';
    } else if (os === 'darwin') this.terminalType = 'macos';
    else this.terminalType = 'linux';
  }

  private detectTheme(): void {
    if (this.mode === 'dark') { this.isDark = true; return; }
    if (this.mode === 'light') { this.isDark = false; return; }

    const colorScheme = process.env.COLORFGBG || '';
    const termTheme = process.env.TERM_THEME || process.env.COLOR_SCHEME || '';

    this.isDark = !(
      colorScheme.includes('light') ||
      termTheme.includes('light') ||
      termTheme.includes('white')
    );
  }

  getColors(): ThemeColors {
    if (this.isDark) {
      return {
        primary: '#6C5CE7',
        secondary: '#A29BFE',
        accent: '#00CEC9',
        success: '#00B894',
        warning: '#FDCB6E',
        error: '#E17055',
        dim: '#636E72',
        border: '#2D3436',
      };
    }
    return {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      accent: '#00CEC9',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E17055',
      dim: '#B2BEC3',
      border: '#DFE6E9',
    };
  }

  get chalkColors() {
    return {
      primary: this.isDark ? chalk.hex('#6C5CE7') : chalk.hex('#5B4CC4'),
      secondary: this.isDark ? chalk.hex('#A29BFE') : chalk.hex('#6C5CE7'),
      accent: this.isDark ? chalk.hex('#00CEC9') : chalk.hex('#00B894'),
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      dim: this.isDark ? chalk.dim : chalk.dim,
    };
  }

  isDarkMode(): boolean {
    return this.isDark;
  }

  getTerminalType(): TerminalType {
    return this.terminalType;
  }
}
