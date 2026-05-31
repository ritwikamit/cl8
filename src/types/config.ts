import { ProviderType } from './provider.js';

export type ApprovalMode = 'ask' | 'auto' | 'deny';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface AIConfig {
  openai?: {
    apiKey?: string;
    model: string;
  };
  gemini?: {
    apiKey?: string;
    model: string;
  };
  ollama?: {
    baseUrl: string;
    model: string;
  };
  defaultProvider: ProviderType;
}

export interface SecurityConfig {
  approvalMode: ApprovalMode;
  allowedCommands: string[];
  blockedCommands: string[];
  maxFileSize: number;
  sandboxEnabled: boolean;
}

export interface WorkspaceConfig {
  root: string;
  allowedPaths: string[];
  blockedPatterns: string[];
}

export interface LoggingConfig {
  level: LogLevel;
  file: string;
  maxSize: number;
  maxFiles: number;
}

export interface PluginConfig {
  directories: string[];
  allowlist: string[];
  blocklist: string[];
}

export interface CL8Config {
  ai: AIConfig;
  security: SecurityConfig;
  workspace: WorkspaceConfig;
  logging: LoggingConfig;
  plugins: PluginConfig;
  theme: string;
  historySize: number;
  onboardingComplete?: boolean;
}
