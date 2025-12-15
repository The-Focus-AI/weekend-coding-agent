import { TOOLS } from "../lib/tools";
import { SYSTEM_PROMPT } from "./system";

export interface Prompt {
  name: string;
  description: string;
  systemPrompt: string;
  tools: any[];
}

const allTools = TOOLS;
const readOnlyTools = TOOLS.filter((t) =>
  ["list_files", "read_file", "search_files"].includes(t.function.name),
);

// Define specialized system prompts
const EXPLORER_PROMPT = `You are a code explorer. Your goal is to understand the codebase and answer questions about it.
You have access to tools to navigate and read code.
You cannot modify files or run commands.
`;

const PLANNER_PROMPT = `You are a feature planner. Your goal is to analyze the codebase and create a detailed plan for implementing a new feature.
You should explore the code to understand the context and then propose a plan.
You can write the plan to a file (e.g., plan.md) but you should not modify code files.
`;

const RESEARCHER_PROMPT = `You are a tech researcher. Your goal is to research technologies or patterns used in the codebase.
You have access to read-only tools.
`;

export const PROMPTS: Record<string, Prompt> = {
  default: {
    name: "default",
    description: "The default full-featured agent.",
    systemPrompt: SYSTEM_PROMPT,
    tools: allTools,
  },
  "code-explorer": {
    name: "code-explorer",
    description: "A read-only agent for exploring the codebase.",
    systemPrompt: EXPLORER_PROMPT,
    tools: readOnlyTools,
  },
  "feature-planner": {
    name: "feature-planner",
    description: "An agent for planning features.",
    systemPrompt: PLANNER_PROMPT,
    tools: TOOLS.filter((t) =>
      [
        "list_files",
        "read_file",
        "search_files",
        "write_file", // Allowed to write plans
      ].includes(t.function.name),
    ),
  },
  "tech-researcher": {
    name: "tech-researcher",
    description: "An agent for technical research.",
    systemPrompt: RESEARCHER_PROMPT,
    tools: readOnlyTools,
  },
};

export function getPrompt(name: string): Prompt {
  return PROMPTS[name] || PROMPTS.default;
}
