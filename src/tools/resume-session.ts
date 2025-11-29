import { Type } from "@google/genai";
import { ToolDefinition, ToolContext } from "./types.js";
import * as fs from "fs/promises";
import * as path from "path";

export const resumeSessionTool: ToolDefinition = {
  name: "resume_session",
  description: "Switch context to a previous session and continue working from there.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      session_id: {
        type: Type.STRING,
        description: "The session ID or filename (or part of it) to resume. Use list_sessions to find IDs.",
      },
    },
    required: ["session_id"],
  },
  execute: async (args: Record<string, unknown>, context: ToolContext) => {
    const sessionId = args.session_id as string;
    
    try {
      const files = await fs.readdir(context.logDir);
      const sessionFiles = files.filter(f => f.endsWith('.jsonl'));
      
      const matchedFile = sessionFiles.find(f => f.includes(sessionId));
      
      if (!matchedFile) {
        return `Session not found matching "${sessionId}". Use list_sessions to see available sessions.`;
      }

      const filePath = path.join(context.logDir, matchedFile);
      const content = await fs.readFile(filePath, 'utf-8');
      
      const lines = content.trim().split('\n');
      const messages = lines.map(line => {
        try {
            return JSON.parse(line);
        } catch (e) {
            return null;
        }
      }).filter(m => m !== null);

      if (messages.length === 0) {
        return "Session file is empty or invalid.";
      }

      await context.loadSession(messages);

      return `Session resumed: ${matchedFile}. The context has been loaded.`;

    } catch (error) {
      return `Error resuming session: ${error}`;
    }
  },
};
