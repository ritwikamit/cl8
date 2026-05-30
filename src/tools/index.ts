import { BaseTool } from './BaseTool.js';
import { FileTool } from './FileTool.js';
import { ShellTool } from './ShellTool.js';
import { SearchTool } from './SearchTool.js';
import { ToolDefinition } from '../types/tool.js';

const BUILT_IN_TOOLS: BaseTool[] = [
  new FileTool(),
  new ShellTool(),
  new SearchTool(),
];

export function getBuiltInTools(): BaseTool[] {
  return BUILT_IN_TOOLS;
}

export function getToolDefinitions(): ToolDefinition[] {
  return BUILT_IN_TOOLS.map(t => t.definition);
}

export function findTool(name: string): BaseTool | undefined {
  return BUILT_IN_TOOLS.find(t => t.getName() === name);
}

export { BaseTool, FileTool, ShellTool, SearchTool };
