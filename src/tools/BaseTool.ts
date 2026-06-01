import { ToolDefinition, ToolInput, ToolOutput, ToolContext } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';

export abstract class BaseTool {
  public definition: ToolDefinition;
  protected logger = getLogger();

  constructor(definition: ToolDefinition) {
    this.definition = definition;
  }

  abstract execute(_input: ToolInput, context: ToolContext): Promise<ToolOutput>;

  validate(_input: ToolInput): boolean {
    return true;
  }

  getName(): string {
    return this.definition.name;
  }

  isDangerous(): boolean {
    return this.definition.dangerous;
  }

  requiresApproval(): boolean {
    return this.definition.requiresApproval;
  }
}
