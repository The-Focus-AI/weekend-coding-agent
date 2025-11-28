import { Type } from "@google/genai";
import * as fs from "node:fs/promises";
import type { ToolDefinition } from "./types.js";

export const readFileTool: ToolDefinition = {
  name: "read_file",
  description: "Read the contents of a file at the given path. Use this to examine existing code before making changes.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The relative path to the file to read",
      },
    },
    required: ["path"],
  },
  async execute(args) {
    const path = args.path as string;
    try {
      const content = await fs.readFile(path, "utf-8");
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return `Error: File not found: ${path}`;
      }
      throw error;
    }
  },
};
