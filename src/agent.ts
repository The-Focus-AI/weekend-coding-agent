import { GoogleGenAI, Chat } from "@google/genai";
import { tools, getToolByName, getToolDeclarations } from "./tools/index.js";
import { Context, createContext } from "./context.js";
import { generateSystemPrompt } from "./prompt.js";

export interface AgentConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
}

export class Agent {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private model: string;
  private systemInstruction: string | undefined;
  private context: Context | null = null;

  constructor(config: AgentConfig) {
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || "gemini-3-pro-preview";
    this.systemInstruction = config.systemInstruction;
  }

  get currentModel(): string {
    return this.model;
  }

  async getHistory(): Promise<any[]> {
    if (!this.chat) return [];
    try {
        // @ts-ignore
        return await this.chat.getHistory();
    } catch (e) {
        console.error("Failed to get history:", e);
        return [];
    }
  }

  async getMessageCount(): Promise<number> {
    if (!this.chat) return 0;
    // Attempt to access history if available, otherwise return 0 or track manually
    // The SDK's Chat object might handle history internally. 
    // We'll inspect it via any for now or just return 0 if not accessible.
    try {
        // @ts-ignore
        const history = await this.chat.getHistory();
        return history.length;
    } catch (e) {
        return 0; 
    }
  }

  async getContextSize(): Promise<number> {
    if (!this.chat) return 0;
    try {
       // @ts-ignore
       const history = await this.chat.getHistory();
       const response = await this.ai.models.countTokens({
           model: this.model,
           contents: history,
       });
       return response.totalTokens || 0;
    } catch (e) {
        return 0;
    }
  }

  async start(): Promise<void> {
    this.context = await createContext();
    const generatedSystemPrompt = generateSystemPrompt(tools, this.context);
    
    this.chat = this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: this.systemInstruction || generatedSystemPrompt,
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

    // Execute all function calls and collect results
    if (functionCalls.length > 0) {
      yield* this.executeFunctionCalls(functionCalls);
    }
  }

  private async *executeFunctionCalls(
    calls: Array<{ name: string; args: Record<string, unknown> }>
  ): AsyncGenerator<string> {
    // Execute all function calls and collect their results
    const functionResponses: Array<{
      functionResponse: { name: string; response: { result: string } };
    }> = [];

    for (const call of calls) {
      yield `\n[Executing ${call.name}...]\n`;

      const tool = getToolByName(call.name);
      if (!tool) {
        yield `[Error: Unknown tool ${call.name}]\n`;
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result: `Error: Unknown tool ${call.name}` },
          },
        });
        continue;
      }

      try {
        const result = await tool.execute(call.args);
        yield `[Result: ${result.slice(0, 100)}${result.length > 100 ? "..." : ""}]\n`;
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result },
          },
        });
      } catch (error) {
        yield `[Error: ${error}]\n`;
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result: `Error: ${error}` },
          },
        });
      }
    }

    // Send ALL function responses back to the model in a single message
    const followUp = await this.chat!.sendMessageStream({
      message: functionResponses,
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
    if (nestedFunctionCalls.length > 0) {
      yield* this.executeFunctionCalls(nestedFunctionCalls);
    }
  }

  reset(): void {
    this.chat = null;
  }
}
