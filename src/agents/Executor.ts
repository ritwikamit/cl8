import { PlanStep, ExecutionResult } from '../types/agent.js';
import { ToolService } from '../services/ToolService.js';
import { ToolCall, ToolContext } from '../types/tool.js';
import { getLogger } from '../utils/logger.js';
import { generateId } from '../utils/crypto.js';

export class Executor {
  private toolService: ToolService;
  private logger = getLogger();

  constructor(toolService: ToolService) {
    this.toolService = toolService;
  }

  async executeStep(step: PlanStep, context: ToolContext): Promise<ExecutionResult> {
    this.logger.info(`Executing step: ${step.description}`);

    step.status = 'in_progress';

    const toolCall: ToolCall = {
      id: generateId(),
      name: step.tool,
      input: {
        ...step.input,
        description: step.description,
      },
      timestamp: new Date(),
    };

    const result = await this.toolService.execute(toolCall, context);

    if (result.output.success) {
      step.status = 'completed';
      const output = result.output.stdout ?? this.stringifyOutput(result.output.data);
      step.result = output;
      return {
        success: true,
        output,
      };
    } else {
      step.status = 'failed';
      step.error = result.output.error;
      return {
        success: false,
        output: result.output.error || '',
        error: result.output.error,
      };
    }
  }

  async executeSteps(
    steps: PlanStep[],
    context: ToolContext
  ): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();

    for (const step of steps) {
      if (step.status === 'completed') continue;

      const result = await this.executeStep(step, context);
      results.set(step.id, result);

      if (!result.success) {
        this.logger.warn(`Step failed: ${step.description} - ${result.error}`);
        break;
      }
    }

    return results;
  }

  private stringifyOutput(data: unknown): string {
    if (typeof data === 'string') return data;
    return JSON.stringify(data ?? '');
  }
}
