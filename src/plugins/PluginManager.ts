import { PluginInstance, PluginManifest } from '../types/plugin.js';
import { ToolDefinition } from '../types/tool.js';
import { PluginLoader } from './PluginLoader.js';
import { getLogger } from '../utils/logger.js';

export class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();
  private loader: PluginLoader;
  private logger = getLogger();

  constructor(pluginDirs: string[]) {
    this.loader = new PluginLoader(pluginDirs);
  }

  async loadAll(): Promise<void> {
    const manifests = await this.loader.discoverPlugins();
    this.logger.info(`Found ${manifests.length} plugin(s)`);

    for (const manifestPath of manifests) {
      const instance = await this.loader.loadPlugin(manifestPath);
      if (instance) {
        this.plugins.set(instance.manifest.name, instance);
      }
    }

    this.logger.info(`Loaded ${this.plugins.size} plugin(s)`);
  }

  getPlugin(name: string): PluginInstance | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): PluginInstance[] {
    return this.getAllPlugins().filter(p => p.enabled);
  }

  enablePlugin(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;
    plugin.enabled = true;
    return true;
  }

  disablePlugin(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;
    plugin.enabled = false;
    return true;
  }

  getPluginTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = [];
    for (const plugin of this.getEnabledPlugins()) {
      tools.push(...plugin.tools);
    }
    return tools;
  }

  getManifests(): PluginManifest[] {
    return Array.from(this.plugins.values()).map(p => p.manifest);
  }

  unloadAll(): void {
    this.plugins.clear();
    this.logger.info('All plugins unloaded');
  }
}
