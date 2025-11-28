import * as readline from "node:readline";
import { Agent } from "./agent.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable required");
  process.exit(1);
}

const agent = new Agent({ apiKey });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(): void {
  rl.question("\nYou: ", async (input) => {
    const trimmed = input.trim();

    if (!trimmed || trimmed === "exit" || trimmed === "quit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    process.stdout.write("\nAgent: ");

    try {
      for await (const chunk of await agent.sendMessage(trimmed)) {
        process.stdout.write(chunk);
      }
      console.log();
    } catch (error) {
      console.error("\nError:", error);
    }

    prompt();
  });
}

console.log("Code Editing Agent (powered by Gemini)");
console.log("Type 'exit' to quit.\n");
prompt();
