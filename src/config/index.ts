import Conf from 'conf';
import path from 'node:path';
import { CL8Config, ApprovalMode, LogLevel } from '../types/config.js';
import { ProviderType } from '../types/provider.js';
import { getEnv, getEnvList, loadEnv } from './env.js';

const DEFAULT_CONFIG: CL8Config = {
  ai: {
    openai: {
      apiKey: undefined,
      model: 'gpt-4o',
    },
    gemini: {
      apiKey: undefined,
      model: 'gemini-2.0-flash',
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'codellama',
    },
    defaultProvider: 'openai',
  },
  security: {
    approvalMode: 'ask',
    allowedCommands: [],
    blockedCommands: ['rm -rf /', 'format', 'del /f /s'],
    maxFileSize: 10 * 1024 * 1024,
    sandboxEnabled: true,
  },
  workspace: {
    root: process.cwd(),
    allowedPaths: [process.cwd()],
    blockedPatterns: ['node_modules', '.git', 'dist', '.next', 'build'],
  },
  logging: {
    level: 'info',
    file: 'logs/cl8.log',
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
  },
  plugins: {
    directories: ['./plugins'],
    allowlist: [],
    blocklist: [],
  },
  theme: 'dark',
  historySize: 100,
};

let store: Conf<CL8Config> | null = null;

function getStore(): Conf<CL8Config> {
  if (!store) {
    store = new Conf<CL8Config>({
      projectName: 'cl8',
      defaults: DEFAULT_CONFIG,
    });
  }
  return store;
}

export function loadConfig(): CL8Config {
  loadEnv();

  const store = getStore();
  const config = { ...DEFAULT_CONFIG };

  const saved = store.store;
  if (saved.ai) config.ai = { ...config.ai, ...saved.ai };
  if (saved.security) config.security = { ...config.security, ...saved.security };
  if (saved.workspace) config.workspace = { ...config.workspace, ...saved.workspace };
  if (saved.plugins) config.plugins = { ...config.plugins, ...saved.plugins };

  config.ai.openai = {
    ...config.ai.openai,
    apiKey: getEnv('OPENAI_API_KEY') || config.ai.openai?.apiKey,
    model: getEnv('OPENAI_MODEL') || config.ai.openai?.model || 'gpt-4o',
  };

  config.ai.gemini = {
    ...config.ai.gemini,
    apiKey: getEnv('GEMINI_API_KEY') || config.ai.gemini?.apiKey,
    model: getEnv('GEMINI_MODEL') || config.ai.gemini?.model || 'gemini-2.0-flash',
  };

  config.ai.ollama = {
    ...config.ai.ollama,
    baseUrl: getEnv('OLLAMA_BASE_URL') || config.ai.ollama?.baseUrl || 'http://localhost:11434',
    model: getEnv('OLLAMA_MODEL') || config.ai.ollama?.model || 'codellama',
  };

  config.ai.defaultProvider = (getEnv('CL8_DEFAULT_PROVIDER') || config.ai.defaultProvider) as ProviderType;

  // Prioritize environment variable, then default to current working directory.
  // This prevents the workspace from becoming "sticky" in the global config store
  // and allows it to follow the user as they change directories.
  config.workspace.root = getEnv('CL8_WORKSPACE') || process.cwd();
  
  config.security.approvalMode = (getEnv('CL8_APPROVAL_MODE') || config.security.approvalMode) as ApprovalMode;
  config.logging.level = (getEnv('CL8_LOG_LEVEL') || config.logging.level) as LogLevel;
  config.plugins.directories = getEnvList('CL8_PLUGIN_DIRS') || config.plugins.directories;

  return config;
}

export function updateConfig(partial: Partial<CL8Config>): CL8Config {
  const store = getStore();
  const current = store.store;
  const merged = {
    ...current,
    ...partial,
    ai: { ...current.ai, ...partial.ai },
    security: { ...current.security, ...partial.security },
    workspace: { ...current.workspace, ...partial.workspace },
    plugins: { ...current.plugins, ...partial.plugins },
  };
  store.set(merged);
  return loadConfig();
}

export function resetConfig(): CL8Config {
  const store = getStore();
  store.clear();
  return loadConfig();
}

export function getConfigPath(): string {
  return getStore().path;
}

export { getStore, DEFAULT_CONFIG };
