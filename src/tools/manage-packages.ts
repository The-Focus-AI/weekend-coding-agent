import { Type } from "@google/genai";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "./types.js";

const execAsync = promisify(exec);

export const managePackagesTool: ToolDefinition = {
  name: "manage_packages",
  description: "Install or remove packages using pnpm.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "The action to perform: 'add' or 'remove'. Use 'add' to install packages.",
      },
      packages: {
        type: Type.STRING,
        description: "Space-separated list of packages to install or remove.",
      },
      dev: {
        type: Type.BOOLEAN,
        description: "Whether to install as devDependencies (only for add action).",
      },
    },
    required: ["action", "packages"],
  },
  async execute(args) {
    const action = args.action as string;
    const packages = args.packages as string;
    const dev = args.dev as boolean;

    if (!["add", "remove"].includes(action)) {
      return "Error: Invalid action. Must be 'add' or 'remove'.";
    }

    let command = `pnpm ${action} ${packages}`;
    if (action === "add" && dev) {
      command += " -D";
    }

    try {
      const { stdout, stderr } = await execAsync(command);
      return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    } catch (error: any) {
      return `Error executing command: ${command}\n${error.message}\n${error.stdout || ""}\n${error.stderr || ""}`;
    }
  },
};
