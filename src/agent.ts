import { callLLM } from "./lib/api";
import {
  type CommandExecutor,
  defaultBashExecutor,
  executeTool,
} from "./lib/tools";
import type { Message } from "./lib/types";

// Type for the API caller to allow injection
type ApiCaller = (messages: Message[]) => Promise<any>;

export async function runTurn(
  history: Message[],
  apiCaller: ApiCaller = callLLM,
  toolExecutor: CommandExecutor = defaultBashExecutor,
): Promise<Message[]> {
  const currentMessages = [...history]; // copy

  while (true) {
    const response = await apiCaller(currentMessages);

    if (response.error) {
      console.error("API Error:", response.error.message);
      throw new Error(response.error.message);
    }

    const m = response.choices[0].message;

    // Handle DeepSeek/OpenRouter reasoning details logging if present (optional side effect)
    if (
      m.reasoning_details &&
      Array.isArray(m.reasoning_details) &&
      m.reasoning_details.length > 0
    ) {
      // We log provided reasoning for visibility, though strictly this might belong in the CLI layer.
      // For clean separation, we might attach it to the object and let the UI handle it,
      // but here we just ensure it's preserved in the message.
    }

    if (m.tool_calls) {
      const toolCall = m.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments); // Assuming only one tool call for now as per bootstrap.ts

      // Notify CLI (side effect - maybe cleaner to use a callback, but console.log is simple)
      console.log(`$ ${args.command}`);

      const result = await executeTool(
        toolCall.function.name,
        args,
        toolExecutor,
      );
      console.log(result);

      // Append Assistant request
      currentMessages.push({
        role: "assistant",
        tool_calls: m.tool_calls,
        reasoning_details: m.reasoning_details,
      });

      // Append Tool result
      currentMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
        name: toolCall.function.name,
      });

      // Loop continues to feed tool result back to LLM
    } else {
      // Final response
      currentMessages.push({
        role: "assistant",
        content: m.content,
        reasoning_details: m.reasoning_details,
      });
      break;
    }
  }

  return currentMessages;
}
