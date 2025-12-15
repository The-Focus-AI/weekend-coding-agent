import { describe, expect, mock, test } from "bun:test";
import { callLLM } from "../src/lib/api";
import { TOOLS } from "../src/tools/index";

// Mock global fetch
const originalFetch = global.fetch;

describe("API Interaction", () => {
  test("should call OpenRouter with correct parameters", async () => {
    let capturedUrl = "";
    let capturedOptions: any = {};

    global.fetch = mock((url: any, options: any) => {
      capturedUrl = url.toString();
      capturedOptions = options;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { role: "assistant", content: "hello" } }],
          }),
        ),
      );
    });

    const messages: any[] = [{ role: "user", content: "hi" }];
    await callLLM(messages);

    expect(capturedUrl).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(capturedOptions.method).toBe("POST");
    const body = JSON.parse(capturedOptions.body);
    expect(body.messages).toHaveLength(1);
    expect(body.tools).toEqual(TOOLS);
    expect(body.include_reasoning).toBe(true);

    // Restore fetch
    global.fetch = originalFetch;
  });
});
