import { describe, expect, mock, test } from "bun:test";
import { executeTool } from "../src/lib/tools";

// Mock the Bash executor
const mockExecutor = mock((cmd: string) => Promise.resolve(`executed: ${cmd}`));

describe("Tool Execution", () => {
  test("should execute bash command correctly (mocked)", async () => {
    // Inject the mock into the tool execution logic
    const result = await executeTool(
      "bash",
      { command: "echo hello" },
      mockExecutor,
    );

    expect(result).toBe("executed: echo hello");
    expect(mockExecutor).toHaveBeenCalled();
    expect(mockExecutor.mock.calls[0][0]).toBe("echo hello");
  });

  test("should throw error for unknown tool", async () => {
    expect(async () => {
      await executeTool("unknown", { some: "arg" });
    }).toThrow("Unknown tool");
  });

  test("should list files in directory using default executor (integration)", async () => {
    // This uses the REAL defaultBashExecutor (no mock)
    // We run 'ls -F' and expect to see known project files.
    const result = await executeTool("bash", { command: "ls -F" });

    // Debug output if needed
    // console.log("ls output:", result);

    expect(result).toContain("package.json");
    expect(result).toContain("src/");
    expect(result).toContain("tests/");
    expect(result).toContain("mise.toml");
  });
});
