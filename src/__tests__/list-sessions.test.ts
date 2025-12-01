import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { listSessionsTool } from "../tools/list-sessions.js";
import { ToolContext } from "../tools/types.js";
import * as fs from "fs/promises";
import * as path from "path";

const TEST_DIR = ".test-sessions";

describe("list_sessions tool", () => {
    const mockContext: ToolContext = {
        ai: {} as any,
        logDir: TEST_DIR,
        loadSession: async () => {}
    };

    beforeEach(async () => {
        await fs.mkdir(TEST_DIR, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    });

    it("lists sessions", async () => {
        await fs.writeFile(path.join(TEST_DIR, "2023-10-27-10-00-test-topic.jsonl"), "");
        await fs.writeFile(path.join(TEST_DIR, "2023-10-28-11-00-another-topic.jsonl"), "");
        
        const result = await listSessionsTool.execute({}, mockContext);
        expect(result).toContain("2023-10-27-10-00: test-topic");
        expect(result).toContain("2023-10-28-11-00: another-topic");
    });

    it("handles empty directory", async () => {
        const result = await listSessionsTool.execute({}, mockContext);
        expect(result).toBe("No sessions found.");
    });
});
