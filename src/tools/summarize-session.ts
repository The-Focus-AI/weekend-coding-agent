import { Type } from "@google/genai";
import { ToolDefinition, ToolContext } from "./types.js";
import * as fs from "fs/promises";
import * as path from "path";

export const summarizeSessionTool: ToolDefinition = {
  name: "summarize_session",
  description: "Generate a report on a past session including goals, completed items, active work, file changes, and lessons learned.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      session_id: {
        type: Type.STRING,
        description: "The session ID or filename (or part of it) to summarize. Use list_sessions to find IDs.",
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
      
      // Parse the JSONL content
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

      // Generate summary using the AI
      const summaryPrompt = `
      Please analyze the following conversation session and generate a structured report.
      
      The report should include:
      1. **Goals**: What was the user trying to achieve?
      2. **Completed Items**: What tasks were finished?
      3. **Active Work**: What was being worked on when the session ended?
      4. **File Changes**: Which files were modified (if apparent)?
      5. **Lessons Learned**: Any key insights or technical details discovered?
      
      Conversation History:
      ${JSON.stringify(messages)}
      `;

      const response = await context.ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [{ role: "user", parts: [{ text: summaryPrompt }] }]
      });

      return `Session Report for ${matchedFile}:\n\n${response.text}`;

    } catch (error) {
      return `Error summarizing session: ${error}`;
    }
  },
};
