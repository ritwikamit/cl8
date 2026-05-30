import { AgentMessage } from './agent.js';

export type ProviderType = 'openai' | 'gemini' | 'ollama';

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface ChatCompletionRequest {
  messages: AgentMessage[];
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  usage?: TokenUsage;
  finishReason?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ProviderCapabilities {
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  maxContextTokens: number;
}
