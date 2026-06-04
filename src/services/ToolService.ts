import { BaseTool } from '../tools/BaseTool.js';
import { getBuiltInTools, findTool } from '../tools/index.js';
import { SecurityService } from './SecurityService.js';
import { AuditService } from './AuditService.js';
import { ToolContext, ToolCall, ToolResult, ToolDefinition } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';

export class ToolService {
  private tools: Map<string, BaseTool> = new Map();
  private security: SecurityService;
  private audit: AuditService;
  private logger = getLogger();

  constructor(security: SecurityService, audit: AuditService) {
    this.security = security;
    this.audit = audit;
    this.registerBuiltIn();
  }

  private registerBuiltIn(): void {
    for (const tool of getBuiltInTools()) {
      this.register(tool);
    }
  }

  register(tool: BaseTool): void {
    this.tools.set(tool.getName(), tool);
    this.logger.info(`Tool registered: ${tool.getName()}`);
  }

  unregister(name: string): void {
    this.tools.delete(name);
    this.logger.info(`Tool unregistered: ${name}`);
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name) || findTool(name);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  async execute(call: ToolCall, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const tool = this.getTool(call.name);

    if (!tool) {
      const result: ToolResult = {
        callId: call.id,
        output: { success: false, error: `Tool not found: ${call.name}` },
        duration: 0,
        timestamp: new Date(),
      };
      this.audit.logToolCall(call, result);
      return result;
    }

    if (tool.requiresApproval() && !context.approved) {
      const approved = await this.security.requestApproval(call.name, call.input, context);
      if (!approved) {
        const result: ToolResult = {
          callId: call.id,
          output: { success: false, error: 'Tool execution denied by user' },
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
        this.audit.logToolCall(call, result);
        return result;
      }
    }

    try {
      const output = await tool.execute(call.input, context);
      const duration = Date.now() - startTime;
      const result: ToolResult = { callId: call.id, output, duration, timestamp: new Date() };
      this.audit.logToolCall(call, result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const result: ToolResult = {
        callId: call.id,
        output: { success: false, error: message },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
      this.audit.logToolCall(call, result);
      return result;
    }
  }
}
