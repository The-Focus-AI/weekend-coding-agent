import { ToolDefinition } from "./tools/index.js";
import { Context } from "./context.js";

export function generateSystemPrompt(tools: ToolDefinition[], context: Context): string {
  const toolsList = tools
    .map((t) => `- ${t.name}: ${t.description}`)
    .join("\n");

  const filesList = context.files.length > 0
    ? "\nFiles:\n" + context.files.map((f) => `- ${f}`).join("\n")
    : "";

  const reportsList = context.reports && context.reports.length > 0
    ? "\n\nAvailable Research Reports:\n" + context.reports.map((r) => 
        `File: ${r.filename}\n---\n${r.frontmatter}\n---`
      ).join("\n\n")
    : "";

  return `You are a code editing assistant. You help users read, understand, and modify code files.

Current Date: ${context.date}${filesList}${reportsList}

Available tools:
${toolsList}

Always read a file before editing it. Make minimal, focused changes.`;
}
