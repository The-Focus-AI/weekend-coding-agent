import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resumeSessionTool } from "../tools/resume-session.js";
import { summarizeSessionTool } from "../tools/summarize-session.js";
import { ToolContext } from "../tools/types.js";
import * as fs from "fs/promises";
import * as path from "path";

const TEST_DIR = ".test-session-tools";

describe("session tools", () => {
    const mockLoadSession = vi.fn();
    const mockGenerateContent = vi.fn();
    
    const mockContext: ToolContext = {
        ai: {
            models: {
                generateContent: mockGenerateContent
            }
        } as any,
        logDir: TEST_DIR,
        loadSession: mockLoadSession
    };

    beforeEach(async () => {
        await fs.mkdir(TEST_DIR, { recursive: true });
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    });

    describe("resume_session", () => {
        it("resumes valid session", async () => {
            const filename = "2023-10-27-test.jsonl";
            const message = { role: "user", parts: [{ text: "hi" }] };
            await fs.writeFile(path.join(TEST_DIR, filename), JSON.stringify(message)); // jsonl single line

            const result = await resumeSessionTool.execute({ session_id: "test" }, mockContext);
            expect(result).toContain("Session resumed");
            expect(mockLoadSession).toHaveBeenCalledWith([message]);
        });

        it("fails if session not found", async () => {
            const result = await resumeSessionTool.execute({ session_id: "missing" }, mockContext);
            expect(result).toContain("Session not found");
        });
    });

    describe("summarize_session", () => {
        it("generates summary", async () => {
            const filename = "2023-10-27-test.jsonl";
            await fs.writeFile(path.join(TEST_DIR, filename), JSON.stringify({ role: "user", parts: [{ text: "hi" }] }));

            mockGenerateContent.mockResolvedValue({
                text: "Summary report"
            });

            const result = await summarizeSessionTool.execute({ session_id: "test" }, mockContext);
            expect(result).toContain("Summary report");
            expect(mockGenerateContent).toHaveBeenCalled();
        });
    });
});
