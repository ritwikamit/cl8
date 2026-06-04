import { BaseProvider } from './BaseProvider.js';
import {
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  ProviderCapabilities,
} from '../types/provider.js';
import { AgentMessage } from '../types/agent.js';

interface OllamaMessage {
  role: string;
  content: string;
  images?: string[];
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaOptions {
  temperature?: number;
  top_p?: number;
  num_predict?: number;
  num_ctx?: number;
}

const DEFAULT_NUM_CTX = 4096;
const DEFAULT_NUM_PREDICT = 2048;

export class OllamaProvider extends BaseProvider {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl?.replace(/\/+$/, '') || 'http://localhost:11434';
  }

  get capabilities(): ProviderCapabilities {
    return {
      streaming: true,
      toolCalling: false,
      vision: true,
      maxContextTokens: DEFAULT_NUM_CTX,
    };
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 60000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${timeoutMs / 1000}s. The model may still be loading. Try again or switch to a smaller model.`);
      }
      throw new Error(`Ollama connection failed: ${err instanceof Error ? err.message : String(err)}. Is Ollama running?`);
    } finally {
      clearTimeout(timeout);
    }
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: this.formatMessagesForOllama(request.messages, request.systemPrompt),
        stream: false,
        options: this.buildOptions(request),
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaResponse;

    return {
      id: crypto.randomUUID(),
      content: data.message?.content || '',
      model: this.config.model,
      usage: data.prompt_eval_count
        ? {
            promptTokens: data.prompt_eval_count,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          }
        : undefined,
      finishReason: 'stop',
    };
  }

  async *chatStream(request: ChatCompletionRequest): AsyncIterable<StreamChunk> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: this.formatMessagesForOllama(request.messages, request.systemPrompt),
        stream: true,
        options: this.buildOptions(request),
      }),
    }, 120000);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line) as OllamaResponse;
          if (data.message?.content) {
            yield { content: data.message.content, done: false };
          }
          if (data.done) {
            yield {
              content: '',
              done: true,
              usage: data.prompt_eval_count
                ? {
                    promptTokens: data.prompt_eval_count,
                    completionTokens: data.eval_count || 0,
                    totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
                  }
                : undefined,
            };
          }
        } catch {
          continue;
        }
      }
    }
  }

  async countTokens(messages: AgentMessage[]): Promise<number> {
    const text = messages.map(m => m.content).join('\n');
    return Math.ceil(text.length / 4);
  }

  private buildOptions(request: ChatCompletionRequest): OllamaOptions {
    return {
      temperature: request.temperature ?? this.config.temperature,
      top_p: request.topP ?? this.config.topP,
      num_predict: request.maxTokens ?? DEFAULT_NUM_PREDICT,
      num_ctx: DEFAULT_NUM_CTX,
    };
  }

  private formatMessagesForOllama(
    messages: AgentMessage[],
    systemPrompt?: string
  ): OllamaMessage[] {
    const result: OllamaMessage[] = [];

    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      const m: OllamaMessage = {
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      };
      if (msg.attachments && msg.attachments.length > 0) {
        const images = msg.attachments
          .filter(a => a.type === 'image')
          .map(a => a.data);
        if (images.length > 0) {
          m.images = images;
        }
      }
      result.push(m);
    }

    return result;
  }
}
