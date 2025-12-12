import * as fs from "node:fs";
import * as path from "node:path";
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

  // Session Logging Setup
  const logDir = path.join(process.cwd(), ".session_logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const logFileName = `${year}-${month}-${day}-${hours}-${minutes}.jsonl`;
  const logFile = path.join(logDir, logFileName);

  function logMessages(messages: Message[]) {
    try {
      for (const msg of messages) {
        fs.appendFileSync(logFile, `${JSON.stringify(msg)}\n`);
      }
    } catch (err) {
      console.error("Failed to write to session log:", err);
    }
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
  let lastLogIndex = 0;

  // Log initial system message
  logMessages(history.slice(lastLogIndex));
  lastLogIndex = history.length;

  console.log("Agent started. Type 'exit' to quit.");
  process.stdout.write("> ");

  // Main REPL loop
  for await (const line of console) {
    const input = line.trim();
    if (input === "exit") break;

    if (!input) {
      process.stdout.write("> ");
      continue;
    }

    // Add user message
    history.push({ role: "user", content: input });

    // Log user message
    logMessages(history.slice(lastLogIndex));
    lastLogIndex = history.length;

    try {
      // Run the agent turn (handles tool loops internally)
      const updatedHistory = await runTurn(history);

      // Update our local history with the new messages (tool calls, tool results, final answer)
      history.length = 0;
      history.push(...updatedHistory);

      // Log new messages from assistant/tools
      logMessages(history.slice(lastLogIndex));
      lastLogIndex = history.length;

      // Print the last message (the final assistant response)
      const lastMsg = history[history.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content) {
        // Reasoning is now printed inside runTurn (streamed)
        console.log("\nAssistant:", lastMsg.content);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }

    process.stdout.write("> ");
  }
}

main();
