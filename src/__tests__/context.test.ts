import { describe, it, expect, vi, afterEach } from "vitest";
import { createContext } from "../context.js";
import * as fs from "fs/promises";

vi.mock("fs/promises");

describe("createContext", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("creates context with files", async () => {
        // Mock readdir to fail or return empty for reports
        (fs.readdir as any).mockResolvedValue([]);
        
        const context = await createContext(["file.ts"]);
        expect(context.files).toEqual(["file.ts"]);
        expect(context.date).toBeDefined();
    });

    it("loads reports", async () => {
        (fs.readdir as any).mockResolvedValue(["report.md", "other.txt"]);
        (fs.readFile as any).mockImplementation(async (path: string) => {
            if (path.includes("report.md")) {
                return "---\ntitle: Test\n---\nContent";
            }
            return "";
        });

        const context = await createContext();
        expect(context.reports).toHaveLength(1);
        expect(context.reports[0].frontmatter).toBe("title: Test");
    });
    
    it("handles errors reading reports", async () => {
        (fs.readdir as any).mockRejectedValue(new Error("No dir"));
        const context = await createContext();
        expect(context.reports).toEqual([]);
    });
});
