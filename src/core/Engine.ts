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
    this.provider = createProvider(providerConfig);

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
    sessionId: string
  ): Promise<AsyncIterable<string>> {
    const history = await this.getContext(sessionId);
    const workspace = this.config.workspace.root;

    return this.agent.processUserInput(input, sessionId, workspace, history);
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
    return `You are CL8, a terminal-based AI assistant that can control the user's computer.

Available tools:
- file: Read, write, edit files on the computer
- shell: Execute shell commands (PowerShell/CMD on Windows, bash on Linux/Mac)
- search: Search for files and content on the computer
- desktop: Open URLs in the browser and launch applications

Capabilities:
- Read, create, and edit any file on the computer
- Run shell commands, scripts, and programs
- Search for files and text patterns
- Open websites in the default browser
- Launch desktop applications
- Automate tasks across the file system

Guidelines:
1. Understand the user's request fully before acting
2. Plan multi-step tasks before executing
3. Read files before editing them
4. Verify changes after making them
5. Explain what you're doing at each step
6. Ask for clarification when needed
7. Never execute dangerous commands without explicit approval
8. Respect the workspace boundaries
9. Keep responses clear and concise
10. Use markdown formatting for structured responses`;
  }
}
