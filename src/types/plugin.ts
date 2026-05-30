import { ToolDefinition } from './tool.js';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  entry: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
}

export interface PluginAPI {
  registerTool: (tool: ToolDefinition) => void;
  getTools: () => ToolDefinition[];
  log: (level: string, message: string) => void;
  config: Record<string, unknown>;
}

export interface PluginInstance {
  manifest: PluginManifest;
  enabled: boolean;
  tools: ToolDefinition[];
  api: PluginAPI;
  instance?: Record<string, unknown>;
}

export interface PluginHook {
  name: string;
  handler: (...args: unknown[]) => Promise<unknown>;
  priority: number;
}

export type PluginState = 'loading' | 'loaded' | 'enabled' | 'disabled' | 'error';
