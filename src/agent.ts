import { callLLM } from "./lib/api";
import type { Message } from "./lib/types";
import { executeTool, TOOLS } from "./tools/index";
import { defaultBashExecutor } from "./tools/system";
import type { CommandExecutor } from "./tools/types";

// Type for the API caller to allow injection
type ApiCaller = (messages: Message[], tools?: any[]) => Promise<any>;

interface TurnResult {
  messages: Message[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export async function runTurn(
  history: Message[],
  apiCaller: ApiCaller = callLLM,
  toolExecutor: CommandExecutor = defaultBashExecutor,
  tools: any[] = TOOLS,
): Promise<TurnResult> {
  const currentMessages = [...history]; // copy
  const usage = {
    prompt_tokens: 0,
    completion_tokens: 0,
  };

  while (true) {
    const response = await apiCaller(currentMessages, tools);

    if (response.usage) {
      usage.prompt_tokens += response.usage.prompt_tokens;
      usage.completion_tokens += response.usage.completion_tokens;
    }

    if (response.error) {
      console.error("API Error:", response.error.message);
      throw new Error(response.error.message);
    }

    const m = response.choices[0].message;

    // Handle DeepSeek/OpenRouter reasoning details logging
    if (m.reasoning_details) {
      if (
        Array.isArray(m.reasoning_details) &&
        m.reasoning_details.length > 0
      ) {
        console.log("\n[Reasoning]:", m.reasoning_details[0].text);
      } else if (typeof m.reasoning_details === "string") {
        console.log("\n[Reasoning]:", m.reasoning_details);
      }
    }

    if (m.tool_calls && m.tool_calls.length > 0) {
      // Append Assistant request (contains ALL tool calls)
      currentMessages.push({
        role: "assistant",
        tool_calls: m.tool_calls,
        reasoning_details: m.reasoning_details,
      });

      // Execute EACH tool call in parallel
      const toolResults = await Promise.all(
        m.tool_calls.map(async (toolCall: any) => {
          const args = JSON.parse(toolCall.function.arguments);

          // Notify CLI nicely
          if (toolCall.function.name === "bash" && args.command) {
            console.log(`$ ${args.command}`);
          } else {
            const argStr = JSON.stringify(args);
            const displayArgs =
              argStr.length > 100 ? `${argStr.substring(0, 97)}...` : argStr;
            console.log(`[Tool: ${toolCall.function.name}] ${displayArgs}`);
          }

          let result = await executeTool(
            toolCall.function.name,
            args,
            toolExecutor,
          );

          // Defensive Ensure result is string
          if (typeof result !== "string") {
            result = String(result);
          }

          // Truncate result for console log if too huge
          const displayResult =
            result.length > 1000
              ? `${result.substring(0, 1000)}... [truncated]`
              : result;
          console.log(displayResult);

          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
            name: toolCall.function.name,
          };
        }),
      );

      // Append ALL Tool results
      currentMessages.push(...(toolResults as any));

      // Loop continues to feed tool results back to LLM
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

  return { messages: currentMessages, usage };
}
