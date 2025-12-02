import * as path from "node:path";
import { Agent } from "./agent.js";
import { CommandManager } from "./commands.js";
import { startTui } from "./tui/index.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable required");
  process.exit(1);
}

const agent = new Agent({ apiKey });
const commandManager = new CommandManager(path.join(process.cwd(), ".claude", "commands"));

(async () => {
    await commandManager.loadCommands();
    // Start TUI
    await startTui(agent, commandManager);
})();
