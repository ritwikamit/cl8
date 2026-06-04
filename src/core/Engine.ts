import { CL8Config } from '../types/config.js';
import { AgentMessage } from '../types/agent.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import { createProvider, getProviderConfig } from '../providers/index.js';
import { ToolService } from '../services/ToolService.js';
import { SecurityService } from '../services/SecurityService.js';
import { AuditService } from '../services/AuditService.js';
import { Agent } from '../agents/Agent.js';
import { ConversationMemory } from '../memory/ConversationMemory.js';
import { SessionManager } from '../memory/SessionManager.js';
import { PluginManager } from '../plugins/PluginManager.js';
import { getLogger } from '../utils/logger.js';

export class Engine {
  private config: CL8Config;
  private provider!: BaseProvider;
  private toolService!: ToolService;
  private securityService!: SecurityService;
  private auditService!: AuditService;
  private agent!: Agent;
  private conversationMemory!: ConversationMemory;
  private sessionManager!: SessionManager;
  private pluginManager!: PluginManager;
  private logger = getLogger();
  private initialized = false;

  constructor(config: CL8Config) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing CL8 Engine...');

    this.securityService = new SecurityService(this.config.security);
    this.auditService = new AuditService('logs', 1000);

    this.toolService = new ToolService(this.securityService, this.auditService);

    const providerConfig = getProviderConfig(this.config.ai);
    this.provider = await createProvider(providerConfig);

    const agentTools = this.toolService.getTools();
    this.agent = new Agent(this.provider, this.toolService, agentTools, {
      systemPrompt: this.getSystemPrompt(),
    });

    this.conversationMemory = new ConversationMemory(
      this.config.workspace.root,
      this.config.ai.openai?.model === 'gpt-4o' ? 128000 : 100000
    );
    await this.conversationMemory.initialize();

    this.sessionManager = new SessionManager(this.config.workspace.root);
    await this.sessionManager.initialize();

    this.pluginManager = new PluginManager(this.config.plugins.directories);
    await this.pluginManager.loadAll();

    for (const plugin of this.pluginManager.getEnabledPlugins()) {
      for (const toolDef of plugin.tools) {
        this.logger.info(`Registering plugin tool: ${toolDef.name}`);
      }
    }

    const session = this.sessionManager.createSession(
      this.config.workspace.root,
      this.config.ai.defaultProvider,
      providerConfig.model
    );

    this.initialized = true;
    this.logger.info(`Engine initialized. Session: ${session.id}`);
  }

  getProvider(): BaseProvider {
    return this.provider;
  }

  getAgent(): Agent {
    return this.agent;
  }

  getToolService(): ToolService {
    return this.toolService;
  }

  getConversationMemory(): ConversationMemory {
    return this.conversationMemory;
  }

  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  getSecurityService(): SecurityService {
    return this.securityService;
  }

  getAuditService(): AuditService {
    return this.auditService;
  }

  getConfig(): CL8Config {
    return this.config;
  }

  async getContext(sessionId: string): Promise<AgentMessage[]> {
    return this.conversationMemory.getMessages(sessionId);
  }

  async addMessage(sessionId: string, message: AgentMessage): Promise<void> {
    await this.conversationMemory.addMessage(sessionId, message);
  }

  async processUserInput(
    input: string,
    sessionId: string,
    askApproval?: (toolName: string, input: Record<string, unknown>) => Promise<boolean>
  ): Promise<AsyncIterable<string>> {
    const history = await this.getContext(sessionId);
    const workspace = this.config.workspace.root;

    return this.agent.processUserInput(input, sessionId, workspace, history, askApproval);
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down CL8 Engine...');

    const session = this.sessionManager.getCurrentSession();
    if (session) {
      await this.sessionManager.endSession(session.id);
    }

    await this.auditService.flush();
    this.pluginManager.unloadAll();

    this.initialized = false;
    this.logger.info('Engine shutdown complete');
  }

  private getSystemPrompt(): string {
    return `You are CL8, a terminal-based AI assistant that controls the user's computer.

You have full IDE capabilities: file management, shell, code intelligence (LSP), version control (git), desktop automation, and search.
You are running on the user's actual machine. You HAVE permission to execute system commands, install software (e.g. winget, brew, npm), and interact with the OS using the shell tool. Do NOT claim you are in a restricted environment.

When the user asks you to do something that requires a tool, output TOOL: lines in this format:
TOOL: <tool_name> | ACTION: <description> | INPUT: <json>

CRITICAL: Every TOOL: file line MUST include the filename in INPUT.path.
CRITICAL: Every TOOL: file line for writing MUST include the full file content in INPUT.content (or in a markdown code block above the TOOL line).
CRITICAL: Every TOOL: shell line MUST include the command in INPUT.command.

Examples:
TOOL: file | ACTION: Read file | INPUT: {"operation":"read","path":"test.txt"}
TOOL: file | ACTION: Write file | INPUT: {"operation":"write","path":"hello.py","content":"print('hello')"}
TOOL: shell | ACTION: Run command | INPUT: {"command":"dir"}
TOOL: desktop | ACTION: Open browser | INPUT: {"action":"open_url","target":"https://google.com"}
TOOL: desktop | ACTION: Launch notepad | INPUT: {"action":"launch_app","target":"notepad.exe"}
TOOL: search | ACTION: Search code | INPUT: {"pattern":"TODO","include":"*.ts"}
TOOL: lsp | ACTION: Go to definition | INPUT: {"action":"definition","file":"src/index.ts","line":10,"character":5}
TOOL: lsp | ACTION: Find references | INPUT: {"action":"references","file":"src/index.ts","line":10,"character":5}
TOOL: lsp | ACTION: Hover info | INPUT: {"action":"hover","file":"src/index.ts","line":10,"character":5}
TOOL: lsp | ACTION: Get diagnostics | INPUT: {"action":"diagnostics","file":"src/index.ts"}
TOOL: lsp | ACTION: Rename symbol | INPUT: {"action":"rename","file":"src/index.ts","line":10,"character":5,"newName":"newName"}
TOOL: lsp | ACTION: Code completion | INPUT: {"action":"completion","file":"src/index.ts","line":10,"character":5}
TOOL: lsp | ACTION: Document symbols | INPUT: {"action":"document_symbols","file":"src/index.ts"}
TOOL: git | ACTION: Git status | INPUT: {"action":"status"}
TOOL: git | ACTION: Git diff | INPUT: {"action":"diff"}
TOOL: git | ACTION: Git log | INPUT: {"action":"log","maxCount":10}
TOOL: git | ACTION: Git commit | INPUT: {"action":"commit","message":"fix bug"}
TOOL: git | ACTION: Git add | INPUT: {"action":"add","file":"src/index.ts"}
TOOL: git | ACTION: Git branch | INPUT: {"action":"branch"}
TOOL: git | ACTION: Git checkout | INPUT: {"action":"checkout","branch":"main"}
TOOL: git | ACTION: Git blame | INPUT: {"action":"blame","file":"src/index.ts"}
TOOL: git | ACTION: Git push | INPUT: {"action":"push","name":"origin","branch":"main"}

If no tool is needed, just respond directly.

Windows-specific notes:
- Prefer using "py" instead of "python" (Python launcher).
- Use "python -m pip" instead of "pip".
- If a command fails (e.g., "not recognized"), ALWAYS try common alternatives before giving up.
- Shell commands use PowerShell syntax.

Guidelines:
1. Understand the user's request fully before acting.
2. Always include the full file path in file tool INPUT.
3. Read files before editing them.
4. Keep responses clear and concise.
5. If a tool execution fails, analyze the error and try a fix (like using a different command or fixing a path).
6. You DO NOT have the ability to simulate keystrokes or interact with GUI applications. If asked to "type" into an app, write to a file instead.
7. To open a file to show the user, use the shell tool (e.g., 'start <filename>' on Windows, 'open <filename>' on Mac).
8. Ask for clarification when needed.`;
  }
}
