import type { ToolDefinition } from "./types.js";
import { readFileTool } from "./read-file.js";
import { listFilesTool } from "./list-files.js";
import { editFileTool } from "./edit-file.js";
import { webSearchTool } from "./web-search.js";

export type { ToolDefinition };

export const tools: ToolDefinition[] = [
  readFileTool,
  listFilesTool,
  editFileTool,
  webSearchTool,
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return tools.find((t) => t.name === name);
}

export function getToolDeclarations() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}
