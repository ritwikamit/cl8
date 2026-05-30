export type ToolCategory = 'file' | 'shell' | 'search' | 'code' | 'network' | 'utility' | 'custom';

export type ToolPermission = 'read' | 'write' | 'execute' | 'admin';

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  permissions: ToolPermission[];
  inputSchema: Record<string, unknown>;
  requiresApproval: boolean;
  dangerous: boolean;
}

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
}

export interface ToolContext {
  workspace: string;
  sessionId: string;
  approved: boolean;
  metadata?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: ToolInput;
  timestamp: Date;
}

export interface ToolResult {
  callId: string;
  output: ToolOutput;
  duration: number;
  timestamp: Date;
}
