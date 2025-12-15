import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { runTurn } from "../src/agent";
import { TOOLS } from "../src/tools";

describe("Subagent Integration", () => {
  const originalLog = console.log;
  const originalError = console.error;

  beforeAll(() => {
    console.log = mock(() => {});
    console.error = mock(() => {});
  });

  afterAll(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  test("should successfully execute a subagent", async () => {
    // We will track the depth/context based on the system prompt or messages content
    const mockApi = mock(async (messages: any[], _tools: any[]) => {
      const lastMsg = messages[messages.length - 1];

      // Check if we are inside the 'tech-researcher' subagent
      const isSubagent = messages.some(
        (m) => m.role === "system" && m.content.includes("tech researcher"),
      );

      if (!isSubagent) {
        // --- Main Agent Logic ---

        // If it's the first user message
        if (
          lastMsg.role === "user" &&
          lastMsg.content === "Research something"
        ) {
          return {
            choices: [
              {
                message: {
                  role: "assistant",
                  tool_calls: [
                    {
                      id: "call_main_1",
                      function: {
                        name: "run_agent",
                        arguments: JSON.stringify({
                          agentName: "tech-researcher",
                          task: "Research patterns",
                        }),
                      },
                    },
                  ],
                },
              },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 10 },
          };
        }

        // If we got the result back from the tool
        if (lastMsg.role === "tool" && lastMsg.name === "run_agent") {
          // Verify the content came from the subagent
          if (lastMsg.content.includes("Found patterns")) {
            return {
              choices: [
                { message: { role: "assistant", content: "Great work." } },
              ],
              usage: { prompt_tokens: 10, completion_tokens: 5 },
            };
          }
        }
      } else {
        // --- Subagent Logic ---

        // Subagent receives the task
        if (
          lastMsg.role === "user" &&
          lastMsg.content === "Research patterns"
        ) {
          return {
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "Found patterns A and B.",
                },
              },
            ],
            usage: { prompt_tokens: 5, completion_tokens: 5 },
          };
        }
      }

      return {
        choices: [
          { message: { role: "assistant", content: "Fallback response" } },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0 },
      };
    });

    const mockToolExecutor = mock(async (_cmd: string) => "executed");

    const history: any[] = [{ role: "user", content: "Research something" }];

    // Prepare tools explicitly including run_agent (simulating what getPrompt('default') would do)
    // We handle this by constructing the tool list manually or trusting the test setup.
    // However, runTurn takes `tools` as an argument.
    // We need to make sure the main agent has the `run_agent` tool in the list passed to runTurn.

    const mainTools = [
      ...TOOLS,
      {
        type: "function",
        function: {
          name: "run_agent",
          parameters: {
            properties: {
              agentName: { type: "string" },
              task: { type: "string" },
            },
            required: ["agentName", "task"],
          },
        },
      },
    ];

    const { messages: updatedHistory } = await runTurn(
      history,
      mockApi as any,
      mockToolExecutor,
      mainTools,
    );

    // Assertions
    // 1. Main Agent called run_agent
    const toolCallMsg = updatedHistory.find(
      (m) => m.role === "assistant" && m.tool_calls,
    );
    expect(toolCallMsg).toBeDefined();
    expect(toolCallMsg?.tool_calls?.[0].function.name).toBe("run_agent");

    // 2. Tool result contains subagent output
    const toolResultMsg = updatedHistory.find(
      (m) => m.role === "tool" && m.name === "run_agent",
    );
    expect(toolResultMsg).toBeDefined();
    expect(toolResultMsg?.content).toContain("Found patterns A and B");

    // 3. Final response matches
    const finalMsg = updatedHistory[updatedHistory.length - 1];
    expect(finalMsg.content).toBe("Great work.");
  });
});
