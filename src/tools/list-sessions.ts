import { Type } from "@google/genai";
import { ToolDefinition, ToolContext } from "./types.js";
import * as fs from "fs/promises";

export const listSessionsTool: ToolDefinition = {
  name: "list_sessions",
  description: "List available past sessions with their timestamps and topics.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
  execute: async (args: Record<string, unknown>, context: ToolContext) => {
    try {
      const files = await fs.readdir(context.logDir);
      const sessionFiles = files.filter(f => f.endsWith('.jsonl'));
      
      if (sessionFiles.length === 0) {
        return "No sessions found.";
      }

      // Sort by name (which includes timestamp) descending
      sessionFiles.sort().reverse();

      const sessions = sessionFiles.map(f => {
        // Filename format: YYYY-MM-DD-HH-MM-TOPIC.jsonl
        const match = f.match(/^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2})-(.*)\.jsonl$/);
        if (match) {
            return `- ${match[1]}: ${match[2]}`;
        }
        return `- ${f}`;
      });

      return "Available sessions:\n" + sessions.join('\n');
    } catch (error) {
      return `Error listing sessions: ${error}`;
    }
  },
};
