import { Type, GoogleGenAI } from "@google/genai";

export interface ToolContext {
  ai: GoogleGenAI;
  logDir: string;
  loadSession: (history: any[]) => Promise<void>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: typeof Type.OBJECT;
    properties: Record<string, {
      type: typeof Type.STRING | typeof Type.NUMBER | typeof Type.BOOLEAN;
      description: string;
    }>;
    required: string[];
  };
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<string>;
}
