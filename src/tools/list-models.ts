import { Type } from "@google/genai";
import type { ToolDefinition } from "./types.js";

export const listModelsTool: ToolDefinition = {
  name: "list_models",
  description: "List the available Gemini models associated with the current API key.",
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No parameters required
    required: [],
  },
  async execute(args, context) {
    if (!context.ai) {
      return "Error: AI client not available in context.";
    }

    try {
      const response = await context.ai.models.list();
      let output = "Available Models:\n";
      
      for await (const model of response) {
          output += `- ${model.name} (${model.version})\n  Description: ${model.displayName}\n`;
      }
      return output;

    } catch (error: any) {
      return `Error listing models: ${error.message || error}`;
    }
  },
};
