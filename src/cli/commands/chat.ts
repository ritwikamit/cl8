import { Engine } from '../../core/Engine.js';
import { InteractiveLoop } from '../../core/Loop.js';
import { Boot, BootOptions } from '../../core/Boot.js';
import { loadConfig } from '../../config/index.js';
import { ProviderType } from '../../types/provider.js';

export async function chatCommand(options: {
  provider?: string;
  model?: string;
  workspace?: string;
  session?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
  noSplash?: boolean;
  resetOnboarding?: boolean;
  theme?: string;
}): Promise<void> {
  const config = loadConfig();

  if (options.provider) {
    config.ai.defaultProvider = options.provider as ProviderType;
  }
  if (options.model) {
    if (config.ai.defaultProvider === 'openai') config.ai.openai!.model = options.model;
    else if (config.ai.defaultProvider === 'gemini') config.ai.gemini!.model = options.model;
    else if (config.ai.defaultProvider === 'ollama') config.ai.ollama!.model = options.model;
  }
  if (options.workspace) {
    config.workspace.root = options.workspace;
  }

  const bootOptions: BootOptions = {
    reducedMotion: options.reducedMotion,
    highContrast: options.highContrast,
    noSplash: options.noSplash,
    resetOnboarding: options.resetOnboarding,
    theme: options.theme as BootOptions['theme'],
  };

  const boot = new Boot(bootOptions);
  const bootResult = await boot.startup(config);

  const engine = new Engine(config);

  if (!bootOptions.noSplash) {
    bootResult.workspacePanel.display(config.workspace.root);
  }

  let sessionId: string | undefined = options.session;

  if (!sessionId && !bootOptions.noSplash) {
    await engine.initialize();
    const sessions = engine.getSessionManager().listSessions(1);
    if (sessions.length > 0) {
      const restore = await boot.promptRestoreSession();
      if (restore) {
        sessionId = sessions[0].id;
        engine.getSessionManager().setCurrentSession(sessionId);
      }
    }
  }

  const loop = new InteractiveLoop(engine, bootResult.theme, sessionId);

  await loop.start();
}
