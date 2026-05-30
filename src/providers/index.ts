import { ProviderConfig, ProviderType } from '../types/provider.js';
import { BaseProvider } from './BaseProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { OllamaProvider } from './OllamaProvider.js';

export function createProvider(config: ProviderConfig): BaseProvider {
  switch (config.type) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    default:
      throw new Error(`Unsupported provider type: ${config.type}`);
  }
}

export function getProviderConfig(config: {
  defaultProvider: ProviderType;
  openai?: { apiKey?: string; model: string };
  gemini?: { apiKey?: string; model: string };
  ollama?: { baseUrl: string; model: string };
}): ProviderConfig {
  const { defaultProvider } = config;

  switch (defaultProvider) {
    case 'openai':
      if (!config.openai?.apiKey) {
        throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in .env');
      }
      return {
        type: 'openai',
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      };
    case 'gemini':
      if (!config.gemini?.apiKey) {
        throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in .env');
      }
      return {
        type: 'gemini',
        apiKey: config.gemini.apiKey,
        model: config.gemini.model,
      };
    case 'ollama':
      return {
        type: 'ollama',
        baseUrl: config.ollama?.baseUrl,
        model: config.ollama?.model || 'codellama',
      };
    default:
      throw new Error(`Unsupported default provider: ${defaultProvider}`);
  }
}

export { BaseProvider, OpenAIProvider, GeminiProvider, OllamaProvider };
