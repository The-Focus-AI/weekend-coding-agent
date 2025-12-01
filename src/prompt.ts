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

Always read a file before editing it. Make minimal, focused changes.

When writing new code or modifying existing logic, always verify coverage or create new tests to ensure functionality.

Before finishing a request, always run 'mise run typecheck' using the run_task tool to check for type errors. Resolve any issues found.
Then, run tests using 'mise run test-run' to ensure no regressions.
When running tests, ensure they do not hang. Use 'test-run' task instead of 'test' to avoid watch mode.`;
}
