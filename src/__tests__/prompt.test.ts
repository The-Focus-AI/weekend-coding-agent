import { describe, it, expect } from "vitest";
import { generateSystemPrompt } from "../prompt.js";
import { Context } from "../context.js";
import { Type } from "@google/genai";
import { ToolDefinition } from "../tools/types.js";

describe("generateSystemPrompt", () => {
  const mockTools: ToolDefinition[] = [
    {
      name: "test-tool",
      description: "A test tool",
      parameters: { type: Type.OBJECT, properties: {}, required: [] },
      execute: async () => "result",
    },
  ];

  const mockContext: Context = {
    files: ["file1.ts", "file2.ts"],
    date: "2023-10-27",
    reports: [
        { filename: "report.md", frontmatter: "title: Report" }
    ]
  };

  it("generates prompt with tools, files, and reports", () => {
    const prompt = generateSystemPrompt(mockTools, mockContext);
    
    expect(prompt).toContain("Current Date: 2023-10-27");
    expect(prompt).toContain("Files:\n- file1.ts\n- file2.ts");
    expect(prompt).toContain("Available Research Reports:\nFile: report.md\n---\ntitle: Report\n---");
    expect(prompt).toContain("- test-tool: A test tool");
  });

  it("handles empty files and reports", () => {
      const emptyContext: Context = {
          files: [],
          date: "2023-10-27",
          reports: []
      };
      const prompt = generateSystemPrompt(mockTools, emptyContext);
      expect(prompt).not.toContain("Files:");
      expect(prompt).not.toContain("Available Research Reports:");
  });
});
