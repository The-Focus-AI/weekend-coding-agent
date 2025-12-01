import { Type } from "@google/genai";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "./types.js";

const execAsync = promisify(exec);

export const runTaskTool: ToolDefinition = {
  name: "run_task",
  description: "Run a task using mise. Use this to run tests, typecheck, or other defined tasks.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      task: {
        type: Type.STRING,
        description: "The name of the task to run (e.g., 'test', 'typecheck', 'build').",
      },
      args: {
        type: Type.STRING,
        description: "Optional arguments to pass to the task.",
      },
    },
    required: ["task"],
  },
  async execute(args) {
    const task = args.task as string;
    const taskArgs = (args.args as string) || "";

    const command = `mise run ${task} ${taskArgs}`;

    try {
      const { stdout, stderr } = await execAsync(command);
      return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    } catch (error: any) {
      return `Error executing command: ${command}\n${error.message}\n${error.stdout || ""}\n${error.stderr || ""}`;
    }
  },
};
