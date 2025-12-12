import { describe, expect, mock, test } from "bun:test";
import { runTurn } from "../src/agent";

describe("Agent Logic", () => {
  test("should handle simple response without tools", async () => {
    // Mock API to return simple message
    const mockApi = mock(() =>
      Promise.resolve({
        choices: [{ message: { role: "assistant", content: "Response" } }],
      }),
    );
    // Override local implementation if possible, or dependency injection.
    // Since we are using ES modules, dependency injection is cleaner.

    const messages: any[] = [{ role: "user", content: "Hello" }];

    const updatedMessages = await runTurn(
      messages,
      mockApi as any,
      null as any,
    );

    expect(updatedMessages.length).toBe(2);
    expect(updatedMessages[1].role).toBe("assistant");
    expect(updatedMessages[1].content).toBe("Response");
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
        };
      }
      return {
        choices: [{ message: { role: "assistant", content: "Done" } }],
      };
    });

    const mockToolExecutor = mock(async (_cmd: string) => "hi");

    const messages: any[] = [{ role: "user", content: "Run echo" }];

    // We pass the mock functions into runTurn
    const updatedMessages = await runTurn(
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
  });
});
