import { Type, GoogleGenAI } from "@google/genai";
import type { ToolDefinition } from "./types.js";

const apiKey = process.env.GEMINI_API_KEY;
// Initialize the client if the key is available
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const listModelsTool: ToolDefinition = {
  name: "list_models",
  description: "List the available Gemini models associated with the current API key.",
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No parameters required
    required: [],
  },
  async execute() {
    if (!genAI) {
      return "Error: GEMINI_API_KEY environment variable not set.";
    }

    try {
      const response = await genAI.models.list();
      let output = "Available Models:\n";
      // The SDK's list() method returns a ListModelsResponse or an async iterable depending on version.
      // Based on typical Google GenAI Node SDK usage:
      
      // If response is iterable directly:
      for await (const model of response) {
          output += `- ${model.name} (${model.version})\n  Description: ${model.displayName}\n`;
      }
      return output;

    } catch (error: any) {
      return `Error listing models: ${error.message || error}`;
    }
  },
};
