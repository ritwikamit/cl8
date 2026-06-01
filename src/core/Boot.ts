import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import readline from 'node:readline';
import { loadConfig, updateConfig } from '../config/index.js';
import { CL8Config } from '../types/config.js';
import { ThemeManager } from '../ui/theme-manager.js';
import { TypingAnimation } from '../ui/typing-animation.js';
import { SpinnerManager } from '../ui/spinner-manager.js';
import { Onboarding } from '../ui/onboarding.js';
import { WorkspacePanel } from '../ui/workspace-panel.js';
import { ContextMonitor } from '../ui/context-monitor.js';
import { StatusBar } from '../ui/status-bar.js';
import { showSplash, showReducedSplash } from '../ui/splash.js';
import { getLogger } from '../utils/logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const tips = JSON.parse(readFileSync(join(__dirname, '../ui/startup-tips.json'), 'utf8'));

export interface BootOptions {
  reducedMotion?: boolean;
  highContrast?: boolean;
  noSplash?: boolean;
  resetOnboarding?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

export interface BootResult {
  config: CL8Config;
  theme: ThemeManager;
  typing: TypingAnimation;
  spinner: SpinnerManager;
  contextMonitor: ContextMonitor;
  statusBar: StatusBar;
  workspacePanel: WorkspacePanel;
}

export class Boot {
  private options: BootOptions;
  private logger = getLogger();

  constructor(options: BootOptions = {}) {
    this.options = options;
  }

  async startup(overrideConfig?: CL8Config): Promise<BootResult> {
    const config = overrideConfig || loadConfig();

    if (this.options.resetOnboarding) {
      updateConfig({ onboardingComplete: false });
      config.onboardingComplete = false;
    }

    const reducedMotion = this.options.reducedMotion || false;
    const theme = new ThemeManager(this.options.theme || 'auto');
    const typing = new TypingAnimation(reducedMotion);
    const spinner = new SpinnerManager(reducedMotion);
    const contextMonitor = new ContextMonitor();
    const statusBar = new StatusBar(theme);
    const workspacePanel = new WorkspacePanel();
    const onboarding = new Onboarding(typing, theme);
    const isFirstLaunch = !config.onboardingComplete;

    if (!this.options.noSplash && isFirstLaunch) {
      await onboarding.showWelcome();
      updateConfig({ onboardingComplete: true });
    }

    if (!this.options.noSplash) {
      if (reducedMotion) {
        await showReducedSplash(theme, config);
      } else {
        await showSplash(theme, config);
      }
    }

    const tip = this.getRandomTip();
    if (!this.options.noSplash) {
      this.showTip(tip, theme);
    }

    this.logger.info(`CL8 started | provider=${config.ai.defaultProvider} model=${this.getModelName(config)}`);

    return {
      config,
      theme,
      typing,
      spinner,
      contextMonitor,
      statusBar,
      workspacePanel,
    };
  }

  promptRestoreSession(): Promise<boolean> {
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(chalk.dim(' Restore previous session? (Y/n) '), (answer: string) => {
        rl.close();
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  }

  private getModelName(config: CL8Config): string {
    switch (config.ai.defaultProvider) {
      case 'openai': return config.ai.openai?.model || 'gpt-4o';
      case 'gemini': return config.ai.gemini?.model || 'gemini-2.0-flash';
      case 'ollama': return config.ai.ollama?.model || 'codellama';
      default: return 'unknown';
    }
  }

  private getRandomTip(): string {
    return tips[Math.floor(Math.random() * tips.length)];
  }

  private showTip(tip: string, theme: ThemeManager): void {
    console.log(`  ${theme.chalkColors.dim('💡')} ${theme.chalkColors.dim(tip)}`);
    console.log();
  }
}
