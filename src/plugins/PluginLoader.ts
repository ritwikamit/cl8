import fs from 'node:fs/promises';
import path from 'node:path';
import { PluginManifest, PluginInstance, PluginAPI } from '../types/plugin.js';
import { ToolDefinition } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';

export class PluginLoader {
  private pluginDirs: string[];
  private logger = getLogger();

  constructor(pluginDirs: string[]) {
    this.pluginDirs = pluginDirs;
  }

  async discoverPlugins(): Promise<string[]> {
    const manifests: string[] = [];

    for (const dir of this.pluginDirs) {
      const resolvedDir = path.resolve(dir);
      try {
        const entries = await fs.readdir(resolvedDir, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const manifestPath = path.join(resolvedDir, entry.name, 'manifest.json');
          try {
            await fs.access(manifestPath);
            manifests.push(manifestPath);
          } catch {
            continue;
          }
        }
      } catch {
        continue;
      }
    }

    return manifests;
  }

  async loadPlugin(manifestPath: string): Promise<PluginInstance | null> {
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);
      const pluginDir = path.dirname(manifestPath);

      const entryPath = path.resolve(pluginDir, manifest.entry);

      let pluginModule: Record<string, unknown>;
      try {
        pluginModule = await import(entryPath);
      } catch {
        this.logger.warn(`Could not load plugin entry: ${entryPath}`);
        return null;
      }

      const tools: ToolDefinition[] = [];
      const api: PluginAPI = {
        registerTool: (tool: ToolDefinition) => {
          tools.push(tool);
        },
        getTools: () => tools,
        log: (level: string, message: string) => {
          this.logger.log(level as any, `[Plugin:${manifest.name}] ${message}`);
        },
        config: manifest.dependencies || {},
      };

      const instance: PluginInstance = {
        manifest,
        enabled: true,
        tools,
        api,
      };

      if (typeof pluginModule.initialize === 'function') {
        await pluginModule.initialize(api);
      }

      this.logger.info(`Plugin loaded: ${manifest.name}@${manifest.version}`);
      return instance;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to load plugin: ${manifestPath} - ${message}`);
      return null;
    }
  }
}
