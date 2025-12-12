import { runTurn } from "./agent";
import { fetchModelStats, MODEL } from "./lib/api";
import type { Message } from "./lib/types";
import { SYSTEM_PROMPT } from "./prompts/system";

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENROUTER_API_KEY is not set.");
    process.exit(1);
  }

  // Fetch and display model stats
  console.log("Fetching model stats for", MODEL, "...");
  const stats = await fetchModelStats();
  if (stats) {
    console.log(`Model: ${stats.name}`);
    console.log(
      `Cost: $${stats.cost.prompt * 1000000} per 1M input tokens, $${stats.cost.completion * 1000000} per 1M output tokens`,
    );
  } else {
    console.log(`Model: ${MODEL} (Stats not found)`);
  }

  // Initialize history with System Prompt
  const history: Message[] = [{ role: "system", content: SYSTEM_PROMPT }];

  console.log("Agent started. Type 'exit' to quit.");

  // Main REPL loop
  for await (const line of console) {
    const input = line.trim();
    if (input === "exit") break;
    if (!input) continue;

    // Add user message
    history.push({ role: "user", content: input });

    try {
      // Run the agent turn (handles tool loops internally)
      const updatedHistory = await runTurn(history);

      // Update our local history with the new messages (tool calls, tool results, final answer)
      // runTurn returns the *entire* array including input history.
      history.length = 0;
      history.push(...updatedHistory);

      // Print the last message (the final assistant response)
      const lastMsg = history[history.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content) {
        if (
          lastMsg.reasoning_details &&
          Array.isArray(lastMsg.reasoning_details) &&
          lastMsg.reasoning_details.length > 0
        ) {
          console.log("\nReasoning:", lastMsg.reasoning_details[0].text);
        }
        console.log("\nAssistant:", lastMsg.content);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}

main();
