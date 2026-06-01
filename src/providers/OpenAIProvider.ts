import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider.js';
import {
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  ProviderCapabilities,
} from '../types/provider.js';
import { AgentMessage } from '../types/agent.js';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  get capabilities(): ProviderCapabilities {
    return {
      streaming: true,
      toolCalling: true,
      vision: true,
      maxContextTokens: 128000,
    };
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const messages = this.formatForAPI(request.messages, request.systemPrompt);

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens,
      stream: false,
    });

    const choice = response.choices[0];
    return {
      id: response.id,
      content: choice?.message?.content || '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
      finishReason: choice?.finish_reason,
    };
  }

  async *chatStream(request: ChatCompletionRequest): AsyncIterable<StreamChunk> {
    const messages = this.formatForAPI(request.messages, request.systemPrompt);

    const stream = await this.client.chat.completions.create({
      model: this.config.model,
      messages,
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        yield { content: delta.content, done: false };
      }

      if (chunk.usage) {
        yield {
          content: '',
          done: true,
          usage: {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
          },
        };
      }
    }
  }

  async countTokens(messages: AgentMessage[]): Promise<number> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.formatForAPI(messages),
        max_tokens: 1,
        stream: false,
      });
      return response.usage?.total_tokens || 0;
    } catch {
      return messages.reduce((acc, m) => acc + m.content.length / 4, 0);
    }
  }

  private formatForAPI(
    messages: AgentMessage[],
    systemPrompt?: string
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.attachments && msg.attachments.length > 0 && msg.role === 'user') {
        const parts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
          { type: 'text', text: msg.content },
        ];
        for (const att of msg.attachments) {
          if (att.type === 'image') {
            parts.push({
              type: 'image_url',
              image_url: { url: `data:${att.mimeType};base64,${att.data}` },
            });
          }
        }
        result.push({ role: 'user', content: parts });
      } else {
        result.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }
    }

    return result;
  }
}
