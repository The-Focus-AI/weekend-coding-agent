import { describe, expect, mock, test } from "bun:test";
import { runTurn } from "../src/agent";

describe("Agent Logic", () => {
  test("should handle simple response without tools", async () => {
    // Mock API to return simple message
    const mockApi = mock(() =>
      Promise.resolve({
        choices: [{ message: { role: "assistant", content: "Response" } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }),
    );

    const messages: any[] = [{ role: "user", content: "Hello" }];

    const { messages: updatedMessages, usage } = await runTurn(
      messages,
      mockApi as any,
      null as any,
    );

    expect(updatedMessages.length).toBe(2);
    expect(updatedMessages[1].role).toBe("assistant");
    expect(updatedMessages[1].content).toBe("Response");
    expect(usage).toBeDefined();
    expect(usage.prompt_tokens).toBe(10);
  });

  test("should handle tool calls", async () => {
    // 1. API says "call tool"
    // 2. Code executes tool
    // 3. API says "final response"

    let callCount = 0;
    const mockApi = mock(async (_msgs: any) => {
      callCount++;
      if (callCount === 1) {
        return {
          choices: [
            {
              message: {
                role: "assistant",
                tool_calls: [
                  {
                    id: "call_1",
                    function: {
                      name: "bash",
                      arguments: JSON.stringify({ command: "echo hi" }),
                    },
                  },
                ],
              },
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        };
      }
      return {
        choices: [{ message: { role: "assistant", content: "Done" } }],
        usage: { prompt_tokens: 20, completion_tokens: 5 },
      };
    });

    const mockToolExecutor = mock(async (_cmd: string) => "hi");

    const messages: any[] = [{ role: "user", content: "Run echo" }];

    // We pass the mock functions into runTurn
    const { messages: updatedMessages, usage } = await runTurn(
      messages,
      mockApi as any,
      mockToolExecutor,
    );

    // Verify history
    // 0: User "Run echo"
    // 1: Assistant (Tool Call)
    // 2: Tool (Result)
    // 3: Assistant "Done"
    expect(updatedMessages.length).toBe(4);
    expect(updatedMessages[1].tool_calls).toBeDefined();
    expect(updatedMessages[2].role).toBe("tool");
    expect(updatedMessages[2].content).toBe("hi");
    expect(updatedMessages[3].content).toBe("Done");

    // Usage should be accumulated: 10 + 20 prompt, 5 + 5 completion
    expect(usage.prompt_tokens).toBe(30);
    expect(usage.completion_tokens).toBe(10);
  });
});
