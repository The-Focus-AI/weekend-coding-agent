import { Type } from "@google/genai";
import * as fs from "node:fs/promises";
import type { ToolDefinition } from "./types.js";

export const listFilesTool: ToolDefinition = {
  name: "list_files",
  description: "List files and directories at the given path. Directories have a trailing slash.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The directory path to list. Defaults to current directory if empty.",
      },
    },
    required: [],
  },
  async execute(args) {
    const dirPath = (args.path as string) || ".";
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const result = entries
        .map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
        .sort()
        .join("\n");
      return result || "(empty directory)";
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return `Error: Directory not found: ${dirPath}`;
      }
      throw error;
    }
  },
};
