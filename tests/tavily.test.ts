import { afterAll, describe, expect, mock, test } from "bun:test";
import { tavilySearch } from "../src/tools/tavily";

describe("Tavily Tool", () => {
  const originalFetch = global.fetch;

  // We can't truly mock process.env efficiently in Bun like this because of how it loads modules,
  // but for the function execution it reads it at runtime, so assigning to process.env should work
  // if we are careful. However, process.env is a special object.
  // We'll rely on the fact that we can set it.

  const originalApiKey = process.env.TAVILY_API_KEY;

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalApiKey) {
      process.env.TAVILY_API_KEY = originalApiKey;
    } else {
      delete process.env.TAVILY_API_KEY;
    }
  });

  test("should perform search successfully", async () => {
    process.env.TAVILY_API_KEY = "test-key";

    // @ts-expect-error
    global.fetch = mock(async (url, init) => {
      if (url === "https://api.tavily.com/search") {
        // Check for Authorization header
        const headers = init.headers as Record<string, string>;
        const authHeader = headers.Authorization;

        // @ts-expect-error
        const body = JSON.parse(init.body as string);

        if (
          authHeader === "Bearer test-key" &&
          body.query === "test query" &&
          body.search_depth === "advanced"
        ) {
          return new Response(
            JSON.stringify({
              query: "test query",
              answer: "This is a test answer",
              results: [
                {
                  title: "Test Result",
                  url: "http://test.com",
                  content: "Result content",
                },
              ],
            }),
          );
        }
      }
      return new Response("Not Found or Invalid Request", { status: 404 });
    });

    const result = await tavilySearch("test query");

    expect(result).toContain('### Search Results for "test query"');
    expect(result).toContain("**Answer:**\nThis is a test answer");
    expect(result).toContain("1. [Test Result](http://test.com)");
    expect(result).toContain("> Result content");
  });

  test("should throw error if API key is missing", async () => {
    delete process.env.TAVILY_API_KEY;

    try {
      await tavilySearch("query");
    } catch (e: any) {
      expect(e.message).toContain("TAVILY_API_KEY is not set");
    }
  });

  test("should handle API error", async () => {
    process.env.TAVILY_API_KEY = "test-key";

    // @ts-expect-error
    global.fetch = mock(async () => {
      return new Response("Error content", {
        status: 401,
        statusText: "Unauthorized",
      });
    });

    const result = await tavilySearch("query");
    expect(result).toContain("Error performing Tavily search");
    expect(result).toContain("Unauthorized");
    expect(result).toContain("Error content");
  });
});
