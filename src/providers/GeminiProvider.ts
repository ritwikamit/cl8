import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { BaseProvider } from './BaseProvider.js';
import {
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  ProviderCapabilities,
} from '../types/provider.js';
import { AgentMessage } from '../types/agent.js';

export class GeminiProvider extends BaseProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey || '');
    this.model = this.client.getGenerativeModel({ model: config.model });
  }

  get capabilities(): ProviderCapabilities {
    return {
      streaming: true,
      toolCalling: true,
      vision: true,
      maxContextTokens: 1000000,
    };
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const history = this.buildHistory(request.messages, request.systemPrompt);
    const chat = this.model.startChat({ history });

    const last = request.messages[request.messages.length - 1];
    const parts = this.messageToParts(last);
    const result = await chat.sendMessage(parts);
    const response = result.response;

    return {
      id: crypto.randomUUID(),
      content: response.text(),
      model: this.config.model,
      usage: undefined,
      finishReason: 'stop',
    };
  }

  async *chatStream(request: ChatCompletionRequest): AsyncIterable<StreamChunk> {
    const history = this.buildHistory(request.messages, request.systemPrompt);
    const chat = this.model.startChat({ history });

    const last = request.messages[request.messages.length - 1];
    const parts = this.messageToParts(last);
    const result = await chat.sendMessageStream(parts);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { content: text, done: false };
      }
    }

    yield { content: '', done: true };
  }

  async countTokens(messages: AgentMessage[]): Promise<number> {
    try {
      const result = await this.model.countTokens(
        messages.map(m => m.content).join('\n')
      );
      return result.totalTokens;
    } catch {
      return messages.reduce((acc, m) => acc + m.content.length / 4, 0);
    }
  }

  private messageToParts(msg: AgentMessage): Part[] {
    const parts: Part[] = [{ text: msg.content }];
    if (msg.attachments) {
      for (const att of msg.attachments) {
        if (att.type === 'image') {
          parts.push({
            inlineData: { mimeType: att.mimeType, data: att.data },
          });
        }
      }
    }
    return parts;
  }

  private buildHistory(messages: AgentMessage[], systemPrompt?: string): Array<{ role: string; parts: Part[] }> {
    const history: Array<{ role: string; parts: Part[] }> = [];

    if (systemPrompt) {
      history.push({
        role: 'user',
        parts: [{ text: `[System Instruction] ${systemPrompt}` }],
      });
      history.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }],
      });
    }

    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: this.messageToParts(msg),
      });
    }

    return history;
  }
}
