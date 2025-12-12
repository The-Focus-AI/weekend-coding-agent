import { $ } from "bun";

export const TOOLS = [
  {
    type: "function",
    function: {
      name: "bash",
      description: "Run bash command",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string" },
        },
        required: ["command"],
      },
    },
  },
];

// Type for the executor function (commands logic)
export type CommandExecutor = (command: string) => Promise<string>;

// Default executor using Bun Shell
export const defaultBashExecutor: CommandExecutor = async (command: string) => {
  try {
    // Using sh -c to simple execution similar to original script
    const result = await $`sh -c ${command}`.text();
    return result;
  } catch (e: any) {
    return e.stderr || e.message || "Unknown error";
  }
};

export async function executeTool(
  name: string,
  args: any,
  // Allow injecting executor for testing
  bashExecutor: CommandExecutor = defaultBashExecutor,
): Promise<string> {
  if (name === "bash") {
    return bashExecutor(args.command);
  }
  throw new Error(`Unknown tool: ${name}`);
}
