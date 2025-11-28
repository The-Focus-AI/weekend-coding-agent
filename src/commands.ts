import * as fs from 'node:fs';
import * as path from 'node:path';
import { Agent } from './agent.js';

interface Command {
  name: string;
  description: string;
  execute: (agent: Agent, args: string[]) => Promise<void>;
}

export class CommandManager {
  private commands: Map<string, Command> = new Map();
  private commandDir: string;

  constructor(commandDir: string) {
    this.commandDir = commandDir;
  }

  async loadCommands() {
    this.commands.clear();
    
    // Add built-in commands
    this.registerCommand({
      name: 'clear',
      description: 'Clear the chat history',
      execute: async (agent) => {
        agent.reset();
        console.log("Chat history cleared.");
      }
    });

    this.registerCommand({
      name: 'quit',
      description: 'Exit the application',
      execute: async () => {
        console.log("Goodbye!");
        process.exit(0);
      }
    });
      
    this.registerCommand({
        name: 'exit',
        description: 'Exit the application',
        execute: async () => {
            console.log("Goodbye!");
            process.exit(0);
        }
    });

    this.registerCommand({
      name: 'help',
      description: 'List all available commands',
      execute: async () => this.listCommands()
    });
    
    this.registerCommand({
      name: '?',
      description: 'List all available commands',
      execute: async () => this.listCommands()
    });

    // Load custom commands from .md files
    if (fs.existsSync(this.commandDir)) {
      const files = fs.readdirSync(this.commandDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const commandName = path.basename(file, '.md');
          const filePath = path.join(this.commandDir, file);
          
          this.registerCommand({
            name: commandName,
            description: `Load and execute ${file}`,
            execute: async (agent, args) => {
              let content = fs.readFileSync(filePath, 'utf-8');
              
              // Simple argument replacement if the prompt template supports it
              if (content.includes('$ARGUMENTS')) {
                  const argsText = args.join(' ');
                  content = content.replace('$ARGUMENTS', argsText);
              } else if (args.length > 0) {
                  // If no placeholder but args provided, append them
                  content += `\n\nUser Input: ${args.join(' ')}`;
              }
              
              console.log(`Executing ${file}...`);
              process.stdout.write("\nAgent: ");
              try {
                for await (const chunk of await agent.sendMessage(content)) {
                    process.stdout.write(chunk);
                }
              } catch (error) {
                console.error("\nError executing command:", error);
              }
              console.log();
            }
          });
        }
      }
    }
  }

  registerCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  async handleCommand(input: string, agent: Agent): Promise<boolean> {
    if (!input.startsWith('/')) return false;

    const args = input.slice(1).trim().split(/\s+/);
    const commandName = args.shift();

    if (!commandName) return false;

    const command = this.commands.get(commandName);
    if (command) {
      await command.execute(agent, args);
      return true;
    }

    console.log(`Unknown command: /${commandName}`);
    return true;
  }

  private listCommands() {
    console.log("\nAvailable commands:");
    for (const [name, cmd] of this.commands.entries()) {
        if (name === "?" || name === "exit") continue; // Hide alias/duplicate
        console.log(`  /${name.padEnd(10)} - ${cmd.description}`);
    }
    console.log();
  }
}
