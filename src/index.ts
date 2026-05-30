// CL8 — Terminal AI Coding & Automation Assistant
// Main public API exports

export { Agent, Planner, Executor, Reflector } from './agents/index.js';
export { Engine, InteractiveLoop } from './core/index.js';
export { loadConfig, updateConfig, resetConfig, getConfigPath } from './config/index.js';
export { createProvider, BaseProvider, OpenAIProvider, GeminiProvider, OllamaProvider } from './providers/index.js';
export { ToolService, SecurityService, AuditService } from './services/index.js';
export { getBuiltInTools, getToolDefinitions, BaseTool, FileTool, ShellTool, SearchTool } from './tools/index.js';
export { ConversationMemory, SessionManager, VectorMemory } from './memory/index.js';
export { PluginManager, PluginLoader } from './plugins/index.js';
export { MarkdownRenderer, Spinner, StreamingOutput } from './ui/index.js';

// Type exports
export type {
  AgentMessage,
  AgentState,
  AgentConfig,
  AgentThought,
  PlanStep,
  ExecutionResult,
  AgentRole,
  AgentStatus,
} from './types/agent.js';

export type {
  ProviderType,
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  TokenUsage,
  ProviderCapabilities,
} from './types/provider.js';

export type {
  ToolDefinition,
  ToolInput,
  ToolOutput,
  ToolContext,
  ToolCall,
  ToolResult,
  ToolCategory,
  ToolPermission,
} from './types/tool.js';

export type {
  CL8Config,
  AIConfig,
  SecurityConfig,
  WorkspaceConfig,
  LoggingConfig,
  PluginConfig,
  ApprovalMode,
  LogLevel,
} from './types/config.js';

export type {
  ConversationMemory as ConversationMemoryType,
  SessionData,
  MemoryEntry,
  MemoryQuery,
  VectorMemoryEntry,
} from './types/memory.js';

export type {
  PluginManifest,
  PluginInstance,
  PluginAPI,
  PluginHook,
  PluginState,
} from './types/plugin.js';
