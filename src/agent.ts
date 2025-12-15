import { callLLM } from "./lib/api";
import type { Logger } from "./lib/logger";
import type { Message } from "./lib/types";
import { getPrompt } from "./prompts/index";
import { executeTool, TOOLS } from "./tools/index";
import { defaultBashExecutor } from "./tools/system";
import type { AgentRunner, CommandExecutor } from "./tools/types";

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
  logger?: Logger,
): Promise<TurnResult> {
  const currentMessages = [...history]; // copy
  const usage = {
    prompt_tokens: 0,
    completion_tokens: 0,
  };

  const agentRunner: AgentRunner = async (agentName: string, task: string) => {
    console.log(`\n--- [Subagent Start] ${agentName} ---`);
    console.log(`Task: ${task}\n`);

    const prompt = getPrompt(agentName);
    const subQuery: Message[] = [
      { role: "system", content: prompt.systemPrompt },
      { role: "user", content: task },
    ];

    const subLogger = logger ? logger.child(agentName) : undefined;
    if (subLogger) {
      subQuery.forEach((m) => {
        subLogger.log(m);
      });
    }

    try {
      const { messages } = await runTurn(
        subQuery,
        apiCaller,
        toolExecutor,
        prompt.tools,
        subLogger,
      );
      const lastMsg = messages[messages.length - 1];
      console.log(`\n--- [Subagent End] ${agentName} ---`);

      if (lastMsg.role === "assistant" && lastMsg.content) {
        return lastMsg.content;
      }
      return "Subagent completed without specific output.";
    } catch (e: any) {
      console.error(`Subagent ${agentName} failed:`, e);
      return `Error executing subagent ${agentName}: ${e.message}`;
    }
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
      const assistantMsg: Message = {
        role: "assistant",
        tool_calls: m.tool_calls,
        reasoning_details: m.reasoning_details,
      };
      currentMessages.push(assistantMsg);
      if (logger) logger.log(assistantMsg);

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
            agentRunner,
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
          } as Message;
        }),
      );

      // Append ALL Tool results
      currentMessages.push(...toolResults);
      if (logger) {
        toolResults.forEach((msg) => {
          logger.log(msg);
        });
      }

      // Loop continues to feed tool results back to LLM
    } else {
      // Final response
      const assistantMsg: Message = {
        role: "assistant",
        content: m.content,
        reasoning_details: m.reasoning_details,
      };
      currentMessages.push(assistantMsg);
      if (logger) logger.log(assistantMsg);
      break;
    }
  }

  return { messages: currentMessages, usage };
}
