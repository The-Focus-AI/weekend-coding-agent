import { Type } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ToolDefinition } from "./types.js";

export const editFileTool: ToolDefinition = {
  name: "edit_file",
  description: "Edit a file by replacing old_str with new_str. If old_str is empty and file doesn't exist, creates a new file with new_str as content.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The file path to edit or create",
      },
      old_str: {
        type: Type.STRING,
        description: "The text to replace. Empty string to create new file.",
      },
      new_str: {
        type: Type.STRING,
        description: "The replacement text or content for new file.",
      },
    },
    required: ["path", "new_str"],
  },
  async execute(args) {
    const filePath = args.path as string;
    const oldStr = (args.old_str as string) || "";
    const newStr = args.new_str as string;

    try {
      const content = await fs.readFile(filePath, "utf-8");

      if (oldStr && !content.includes(oldStr)) {
        return `Error: old_str not found in file`;
      }

      const newContent = oldStr ? content.replace(oldStr, newStr) : newStr;
      await fs.writeFile(filePath, newContent, "utf-8");
      return "OK";
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT" && !oldStr) {
        // Create new file
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, newStr, "utf-8");
        return "OK (created new file)";
      }
      throw error;
    }
  },
};
