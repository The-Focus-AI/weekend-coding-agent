import * as readline from "node:readline";
import * as path from "node:path";
import { Agent } from "./agent.js";
import { CommandManager } from "./commands.js";
import { SessionLogger } from "./logger.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable required");
  process.exit(1);
}

const agent = new Agent({ apiKey });
const logger = new SessionLogger(apiKey);
const commandManager = new CommandManager(path.join(process.cwd(), ".claude", "commands"));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function prompt(): Promise<void> {
  const msgCount = await agent.getMessageCount();
  const contextSize = await agent.getContextSize();
  
  rl.question(`\n[${msgCount} msgs, ${contextSize} tokens] You: `, async (input) => {
    const trimmed = input.trim();

    if (!trimmed) {
        prompt();
        return;
    }

    // Check if it's a command
    if (trimmed.startsWith('/')) {
        const handled = await commandManager.handleCommand(trimmed, agent);
        
        // Log session state after command
        const history = await agent.getHistory();
        if (history.length === 0) {
            logger.reset();
        } else {
            await logger.log(history);
        }

        // If handled, loop back. If not handled (unknown command), it printed error, loop back.
        // If it was quit/exit, the process would have exited.
        prompt();
        return;
    }

    if (trimmed === "exit" || trimmed === "quit") {
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
      
      const history = await agent.getHistory();
      await logger.log(history);

    } catch (error) {
      console.error("\nError:", error);
    }

    prompt();
  });
}

(async () => {
    await commandManager.loadCommands();
    console.log("Code Editing Agent (powered by Gemini)");
    console.log(`Model: ${agent.currentModel}`);
    console.log("Type '/?' to list available commands, or 'exit' to quit.\n");
    prompt();
})();
