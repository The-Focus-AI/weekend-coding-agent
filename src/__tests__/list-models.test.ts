import { describe, it, expect, vi } from "vitest";
import { listModelsTool } from "../tools/list-models.js";
import { ToolContext } from "../tools/types.js";

describe("list_models tool", () => {
    it("lists models", async () => {
        const mockModels = [
            { name: "models/gemini-pro", version: "001", displayName: "Gemini Pro" },
            { name: "models/gemini-ultra", version: "001", displayName: "Gemini Ultra" }
        ];

        // Mock async iterable response
        const mockList = vi.fn().mockReturnValue({
            [Symbol.asyncIterator]: async function* () {
                for (const m of mockModels) yield m;
            }
        });

        const mockContext: ToolContext = {
            ai: {
                models: {
                    list: mockList
                }
            } as any,
            logDir: "",
            loadSession: async () => {}
        };

        const result = await listModelsTool.execute({}, mockContext);
        expect(result).toContain("gemini-pro");
        expect(result).toContain("Gemini Ultra");
    });
});
