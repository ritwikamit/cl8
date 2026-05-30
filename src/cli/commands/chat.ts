import { Engine } from '../../core/Engine.js';
import { InteractiveLoop } from '../../core/Loop.js';
import { loadConfig } from '../../config/index.js';
import { getLogger } from '../../utils/logger.js';

export async function chatCommand(options: {
  provider?: string;
  model?: string;
  workspace?: string;
  session?: string;
}): Promise<void> {
  const config = loadConfig();

  if (options.provider) {
    config.ai.defaultProvider = options.provider as any;
  }
  if (options.model) {
    if (config.ai.defaultProvider === 'openai') config.ai.openai!.model = options.model;
    else if (config.ai.defaultProvider === 'gemini') config.ai.gemini!.model = options.model;
    else if (config.ai.defaultProvider === 'ollama') config.ai.ollama!.model = options.model;
  }
  if (options.workspace) {
    config.workspace.root = options.workspace;
  }

  const engine = new Engine(config);
  const loop = new InteractiveLoop(engine);

  await loop.start();
}
