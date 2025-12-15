import {
  listFiles,
  readFileContent,
  replaceInFile,
  writeFileContent,
} from "./files";
import { gitDiff } from "./git";
import { searchFiles } from "./search";
import { defaultBashExecutor, runBash } from "./system";
import type { AgentRunner, CommandExecutor } from "./types";

export { defaultBashExecutor } from "./system";
export type { CommandExecutor } from "./types";

export const TOOLS = [
  {
    type: "function",
    function: {
      name: "bash",
      description: "Run bash command (Use only as a last resort)",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string" },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files in a directory",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to list (default: .)" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the content of a file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to file" },
          startLine: {
            type: "number",
            description: "Line number to start reading from (default: 1)",
          },
          limit: {
            type: "number",
            description: "Number of lines to read (default: 500)",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Create or overwrite a file with full content",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to file" },
          content: { type: "string", description: "Full content of the file" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "replace_in_file",
      description:
        "Replace a unique string in a file with a new string. Fails if the string is not found or not unique.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to file" },
          oldText: { type: "string", description: "Exact text to replace" },
          newText: { type: "string", description: "New text to insert" },
        },
        required: ["path", "oldText", "newText"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_files",
      description: "Search for a string pattern in files (using ripgrep)",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "String to search for" },
          path: {
            type: "string",
            description: "Directory to search in (default: .)",
          },
          includeNodeModules: {
            type: "boolean",
            description:
              "Whenever to include node_modules in the search (default: false)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_check",
      description: "Run 'mise run check' to verify TypeScript and tests",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "git_diff",
      description: "Show unstaged changes (git diff)",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

export async function executeTool(
  name: string,
  args: any,
  bashExecutor: CommandExecutor = defaultBashExecutor,
  agentRunner?: AgentRunner,
): Promise<string> {
  switch (name) {
    case "bash":
      return runBash(args.command, bashExecutor);
    case "list_files":
      return listFiles(args.path);
    case "read_file":
      return readFileContent(args.path, args.startLine, args.limit);
    case "write_file":
      return writeFileContent(args.path, args.content);
    case "replace_in_file":
      return replaceInFile(args.path, args.oldText, args.newText);
    case "search_files":
      return searchFiles(args.query, args.path, args.includeNodeModules);
    case "run_check":
      return runBash("mise run check", bashExecutor);
    case "git_diff":
      return gitDiff(bashExecutor);
    case "run_agent":
      if (!agentRunner) throw new Error("Agent runner not provided");
      return agentRunner(args.agentName, args.task);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
