import chalk from 'chalk';
import { loadConfig, updateConfig, resetConfig, getConfigPath } from '../../config/index.js';
import { CL8Config } from '../../types/config.js';

export async function configCommand(options: {
  show?: boolean;
  set?: string;
  value?: string;
  reset?: boolean;
  path?: boolean;
}): Promise<void> {
  if (options.path) {
    console.log(getConfigPath());
    return;
  }

  if (options.reset) {
    const config = resetConfig();
    console.log(chalk.green('Configuration reset to defaults.'));
    return;
  }

  if (options.set && options.value) {
    const config = loadConfig();
    const keys = options.set.split('.');

    let current: any = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = parseValue(options.value);

    updateConfig(config);
    console.log(chalk.green(`Set ${options.set} = ${options.value}`));
    return;
  }

  const config = loadConfig();
  console.log(chalk.cyan('\n  CL8 Configuration:\n'));

  printConfig(config, '');
  console.log('');
}

function printConfig(obj: any, prefix: string): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (fullKey) {
        console.log(chalk.dim(`  ${fullKey}:`));
      }
      printConfig(value, fullKey);
    } else {
      const display = key.toLowerCase().includes('key') && value
        ? `${String(value).slice(0, 4)}...${String(value).slice(-4)}`
        : String(value);
      console.log(`  ${chalk.bold(key)}: ${chalk.cyan(display)}`);
    }
  }
}

function parseValue(value: string): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  const num = Number(value);
  if (!isNaN(num)) return num;
  return value;
}
