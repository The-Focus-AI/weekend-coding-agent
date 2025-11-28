import { Type } from "@google/genai";

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
  execute: (args: Record<string, unknown>) => Promise<string>;
}
