import { ProviderConfig, ChatCompletionRequest, ChatCompletionResponse, StreamChunk, ProviderCapabilities } from '../types/provider.js';
import { AgentMessage } from '../types/agent.js';
import { getLogger } from '../utils/logger.js';

export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected logger = getLogger();

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract get capabilities(): ProviderCapabilities;

  abstract chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;

  abstract chatStream(request: ChatCompletionRequest): AsyncIterable<StreamChunk>;

  abstract countTokens(messages: AgentMessage[]): Promise<number>;

  protected formatMessages(messages: AgentMessage[], systemPrompt?: string): AgentMessage[] {
    const formatted: AgentMessage[] = [];

    if (systemPrompt) {
      formatted.push({
        id: 'system',
        role: 'system',
        content: systemPrompt,
        timestamp: new Date(),
      });
    }

    for (const msg of messages) {
      if (msg.role !== 'system') {
        formatted.push(msg);
      }
    }

    return formatted;
  }

  getProviderInfo(): { name: string; model: string } {
    return { name: this.config.type, model: this.config.model };
  }
}
