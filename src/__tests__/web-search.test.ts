import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { webSearchTool } from "../tools/web-search.js";
import { ToolContext } from "../tools/types.js";

const mockSearch = vi.fn();

vi.mock("@tavily/core", () => ({
    tavily: () => ({
        search: mockSearch
    })
}));

describe("web_search tool", () => {
    const mockContext = {} as ToolContext;
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("performs search", async () => {
        process.env.TAVILY_API_KEY = "test-key";
        mockSearch.mockResolvedValue({
            answer: "The answer",
            results: [
                { title: "Result 1", url: "http://example.com", content: "Content 1" }
            ]
        });

        const result = await webSearchTool.execute({ query: "test query" }, mockContext);
        expect(result).toContain("Summary: The answer");
        expect(result).toContain("Result 1");
        expect(mockSearch).toHaveBeenCalledWith("test query", expect.anything());
    });

    it("handles missing API key", async () => {
        delete process.env.TAVILY_API_KEY;
        const result = await webSearchTool.execute({ query: "test query" }, mockContext);
        expect(result).toContain("Error: TAVILY_API_KEY not configured");
    });
});
