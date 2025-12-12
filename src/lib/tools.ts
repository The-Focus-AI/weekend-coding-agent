import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

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
      description: "Search for a string pattern in files (using grep)",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "String to search for" },
          path: {
            type: "string",
            description: "Directory to search in (default: .)",
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
  {
    type: "function",
    function: {
      name: "git_commit",
      description: "Stage all changes and commit with a message",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "Commit message" },
        },
        required: ["message"],
      },
    },
  },
];

// Type for the executor function (commands logic)
export type CommandExecutor = (command: string) => Promise<string>;

// Default executor using Bun Shell
export const defaultBashExecutor: CommandExecutor = async (command: string) => {
  try {
    const result = await $`sh -c ${command}`.text();
    return result;
  } catch (e: any) {
    return e.stderr || e.message || "Unknown error";
  }
};

// --- Tool Implementations ---

async function listFiles(dirPath: string = "."): Promise<string> {
  try {
    const files = await readdir(dirPath);
    // Add logic to clarify file vs directory if needed, for now just list
    // A simple ls -F style suffixing could be useful
    const detailedList = await Promise.all(
      files.map(async (f) => {
        const fullPath = join(dirPath, f);
        try {
          const s = await stat(fullPath);
          return s.isDirectory() ? `${f}/` : f;
        } catch {
          return f;
        }
      }),
    );
    return detailedList.join("\n");
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch (e: any) {
    return `Error reading file: ${e.message}`;
  }
}

async function writeFileContent(
  filePath: string,
  content: string,
): Promise<string> {
  try {
    await writeFile(filePath, content, "utf-8");
    return `Successfully wrote to ${filePath}`;
  } catch (e: any) {
    return `Error writing file: ${e.message}`;
  }
}

async function replaceInFile(
  filePath: string,
  oldText: string,
  newText: string,
): Promise<string> {
  try {
    const content = await readFile(filePath, "utf-8");
    if (!content.includes(oldText)) {
      return `Error: 'oldText' not found in ${filePath}`;
    }
    // Check uniqueness
    if (content.split(oldText).length - 1 > 1) {
      return `Error: 'oldText' is not unique in ${filePath}. Please provide more context.`;
    }
    const newContent = content.replace(oldText, newText);
    await writeFile(filePath, newContent, "utf-8");
    return `Successfully replaced text in ${filePath}`;
  } catch (e: any) {
    return `Error replacing text: ${e.message}`;
  }
}

async function searchFiles(
  query: string,
  searchPath: string = ".",
): Promise<string> {
  try {
    // using grep -rn to find recursive, line number
    const result = await $`grep -rn ${query} ${searchPath}`.text();
    return result || "No matches found.";
  } catch (e: any) {
    // Grep returns exit code 1 if no matches found, which bun might catch as error
    if (e.exitCode === 1) return "No matches found.";
    return `Error searching files: ${e.stderr || e.message}`;
  }
}

export async function executeTool(
  name: string,
  args: any,
  bashExecutor: CommandExecutor = defaultBashExecutor,
): Promise<string> {
  switch (name) {
    case "bash":
      return bashExecutor(args.command);
    case "list_files":
      return listFiles(args.path);
    case "read_file":
      return readFileContent(args.path);
    case "write_file":
      return writeFileContent(args.path, args.content);
    case "replace_in_file":
      return replaceInFile(args.path, args.oldText, args.newText);
    case "search_files":
      return searchFiles(args.query, args.path);
    case "run_check":
      return bashExecutor("mise run check");
    case "git_diff":
      return bashExecutor("git diff");
    case "git_commit":
      // Escaping message nicely
      return bashExecutor(`git add . && git commit -m "${args.message}"`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
