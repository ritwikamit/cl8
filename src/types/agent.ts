export type AgentRole = 'user' | 'assistant' | 'system' | 'tool';

export type AgentStatus = 'idle' | 'thinking' | 'planning' | 'executing' | 'reflecting' | 'responding' | 'error';

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentThought {
  step: number;
  reasoning: string;
  plan?: string[];
  action?: string;
  observation?: string;
}

export interface AgentConfig {
  maxTurns: number;
  maxRetries: number;
  temperature: number;
  topP: number;
  systemPrompt: string;
  allowedTools: string[];
  contextWindow: number;
}

export interface AgentState {
  status: AgentStatus;
  turn: number;
  messages: AgentMessage[];
  thoughts: AgentThought[];
  currentTool?: string;
  error?: string;
}

export interface PlanStep {
  id: string;
  description: string;
  tool: string;
  input: Record<string, unknown>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, unknown>;
}
