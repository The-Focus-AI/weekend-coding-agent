import { describe, it, expect, vi, afterEach } from "vitest";
import { runTaskTool } from "../tools/run-task.js";
import { ToolContext } from "../tools/types.js";
import * as child_process from "node:child_process";

vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

describe("run_task tool", () => {
    const mockContext = {} as ToolContext;

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("executes valid task successfully", async () => {
        const mockExec = child_process.exec as unknown as ReturnType<typeof vi.fn>;
        // exec(cmd, callback)
        mockExec.mockImplementation((cmd: string, callback: any) => {
            callback(null, { stdout: "Success", stderr: "" });
        });

        const result = await runTaskTool.execute({ task: "test" }, mockContext);
        expect(result).toContain("STDOUT:\nSuccess");
        // Arguments might include options, so we just check the command string if possible
        // but promisify might call it differently.
        // Actually exec signature is (command, options, callback) or (command, callback)
        expect(mockExec).toHaveBeenCalled();
        const callArgs = mockExec.mock.calls[0];
        expect(callArgs[0]).toBe("mise run test ");
    });

     it("handles task execution error", async () => {
        const mockExec = child_process.exec as unknown as ReturnType<typeof vi.fn>;
        mockExec.mockImplementation((cmd: string, callback: any) => {
            const error = new Error("Command failed");
            (error as any).stdout = "partial out";
            (error as any).stderr = "error details";
            callback(error, { stdout: "partial out", stderr: "error details" });
        });

        const result = await runTaskTool.execute({ task: "fail" }, mockContext);
        expect(result).toContain("Error executing command: mise run fail");
        expect(result).toContain("Command failed");
    });
});
