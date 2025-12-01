import { Type } from "@google/genai";
import { tavily } from "@tavily/core";
import type { ToolDefinition } from "./types.js";

export const webSearchTool: ToolDefinition = {
  name: "web_search",
  description: "Search the web for current documentation, code examples, or technical information. Use when you need up-to-date information beyond your training data.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query",
      },
    },
    required: ["query"],
  },
  async execute(args) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return "Error: TAVILY_API_KEY not configured";
    }

    const tvly = tavily({ apiKey });

    const query = args.query as string;
    const response = await tvly.search(query, {
      searchDepth: "basic",
      maxResults: 5,
      includeAnswer: true,
    });

    let result = "";
    if (response.answer) {
      result += `Summary: ${response.answer}\n\n`;
    }
    result += "Sources:\n";
    result += response.results
      .map((r) => `- ${r.title}\n  ${r.url}\n  ${r.content.slice(0, 200)}...`)
      .join("\n\n");

    return result;
  },
};
