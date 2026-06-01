import { PlanStep, ExecutionResult, AgentMessage, AgentThought } from '../types/agent.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import { getLogger } from '../utils/logger.js';
import { generateId } from '../utils/crypto.js';

interface ReflectionResult {
  satisfied: boolean;
  feedback: string;
  suggestedFixes: string[];
  needsReplan: boolean;
}

export class Reflector {
  private provider: BaseProvider;
  private logger = getLogger();

  constructor(provider: BaseProvider) {
    this.provider = provider;
  }

  async reflect(
    userInput: string,
    steps: PlanStep[],
    results: Map<string, ExecutionResult>,
    context: AgentMessage[]
  ): Promise<ReflectionResult> {
    const completedSteps = steps.filter(s => s.status === 'completed');
    const failedSteps = steps.filter(s => s.status === 'failed');

    if (failedSteps.length === 0 && completedSteps.length === steps.length) {
      return {
        satisfied: true,
        feedback: 'All steps completed successfully.',
        suggestedFixes: [],
        needsReplan: false,
      };
    }

    if (failedSteps.length > 0) {
      const summary = failedSteps
        .map(s => `- ${s.description}: ${s.error}`)
        .join('\n');

      const messages: AgentMessage[] = [
        ...context.slice(-5),
        {
          id: generateId(),
          role: 'user' as const,
          content: `The following steps failed during execution:\n${summary}\n\nOriginal request: ${userInput}\n\nAnalyze the failures and suggest fixes. Should we replan?`,
          timestamp: new Date(),
        },
      ];

      const response = await this.provider.chat({
        messages,
        maxTokens: 512,
        temperature: 0.3,
      });

      return {
        satisfied: false,
        feedback: response.content,
        suggestedFixes: this.extractSuggestions(response.content),
        needsReplan: this.shouldReplan(response.content),
      };
    }

    return {
      satisfied: false,
      feedback: 'Some steps were not executed.',
      suggestedFixes: [],
      needsReplan: false,
    };
  }

  async generateResponse(
    userInput: string,
    steps: PlanStep[],
    _results: Map<string, ExecutionResult>,
    _thought: AgentThought
  ): Promise<string> {
    let prompt: string;

    if (steps.length === 0) {
      prompt = `The user has a request: "${userInput}"\n\nPlease provide a direct and helpful response. If it's a coding request, provide the complete code. No execution steps were performed because this was identified as a simple request.`;
    } else {
      const stepsSummary = steps
        .map(s => `- ${s.description}: ${s.status}${s.result ? `\n  Result: ${s.result.slice(0, 500)}` : ''}`)
        .join('\n');

      prompt = `Original request: ${userInput}\n\nExecution summary:\n${stepsSummary}\n\nProvide a clear, helpful summary of what was done and the results. Include any code that was generated or modified.`;
    }

    const messages: AgentMessage[] = [
      {
        id: generateId(),
        role: 'user' as const,
        content: prompt,
        timestamp: new Date(),
      },
    ];

    const response = await this.provider.chat({
      messages,
      maxTokens: 2048,
      temperature: 0.5,
    });
    return response.content;
  }

  private extractSuggestions(feedback: string): string[] {
    const suggestions: string[] = [];
    const lines = feedback.split('\n');

    let inSuggestions = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('fix')) {
        inSuggestions = true;
      }
      if (inSuggestions && line.trim().startsWith('-') || line.trim().startsWith('*') || line.match(/^\d+[.)]/)) {
        suggestions.push(line.trim().replace(/^[-*\d.)\s]+/, '').trim());
      }
    }

    return suggestions;
  }

  private shouldReplan(feedback: string): boolean {
    const lower = feedback.toLowerCase();
    return (
      lower.includes('replan') ||
      lower.includes('restart') ||
      lower.includes('new approach') ||
      lower.includes('different strategy')
    );
  }
}
