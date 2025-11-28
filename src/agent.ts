import { GoogleGenAI, Chat } from "@google/genai";
import { tools, getToolByName, getToolDeclarations } from "./tools/index.js";

export interface AgentConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
}

export class Agent {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private model: string;
  private systemInstruction: string;

  constructor(config: AgentConfig) {
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || "gemini-2.0-flash";
    this.systemInstruction = config.systemInstruction || `You are a code editing assistant. You help users read, understand, and modify code files.

Available tools:
- read_file: Read file contents before making changes
- list_files: Explore directory structure
- edit_file: Make targeted edits to files
- web_search: Search the web for documentation and examples

Always read a file before editing it. Make minimal, focused changes.`;
  }

  async start(): Promise<void> {
    this.chat = this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: this.systemInstruction,
        tools: [{ functionDeclarations: getToolDeclarations() }],
      },
    });
  }

  async sendMessage(message: string): Promise<AsyncGenerator<string>> {
    if (!this.chat) {
      await this.start();
    }

    return this.processMessage(message);
  }

  private async *processMessage(message: string): AsyncGenerator<string> {
    const stream = await this.chat!.sendMessageStream({ message });

    let functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    for await (const chunk of stream) {
      // Check for function calls first to avoid SDK warning about non-text parts
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        functionCalls.push(...chunk.functionCalls
          .filter(fc => fc.name !== undefined)
          .map(fc => ({
            name: fc.name!,
            args: fc.args as Record<string, unknown>,
          })));
      } else if (chunk.text) {
        // Only access .text when there are no function calls
        yield chunk.text;
      }
    }

    // Execute any function calls
    for (const call of functionCalls) {
      yield* this.executeFunctionCall(call);
    }
  }

  private async *executeFunctionCall(
    call: { name: string; args: Record<string, unknown> }
  ): AsyncGenerator<string> {
    yield `\n[Executing ${call.name}...]\n`;

    const tool = getToolByName(call.name);
    if (!tool) {
      yield `[Error: Unknown tool ${call.name}]\n`;
      return;
    }

    try {
      const result = await tool.execute(call.args);
      yield `[Result: ${result.slice(0, 100)}${result.length > 100 ? "..." : ""}]\n`;

      // Send result back to model
      const followUp = await this.chat!.sendMessageStream({
        message: [{
          functionResponse: {
            name: call.name,
            response: { result },
          },
        }],
      });

      // Stream the follow-up response and collect any nested function calls
      const nestedFunctionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

      for await (const chunk of followUp) {
        // Check for function calls first to avoid SDK warning about non-text parts
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          nestedFunctionCalls.push(...chunk.functionCalls
            .filter(fc => fc.name !== undefined)
            .map(fc => ({
              name: fc.name!,
              args: fc.args as Record<string, unknown>,
            })));
        } else if (chunk.text) {
          yield chunk.text;
        }
      }

      // Handle nested function calls recursively
      for (const nestedCall of nestedFunctionCalls) {
        yield* this.executeFunctionCall(nestedCall);
      }
    } catch (error) {
      yield `[Error: ${error}]\n`;
    }
  }

  reset(): void {
    this.chat = null;
  }
}
