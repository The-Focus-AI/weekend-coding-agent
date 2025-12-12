import { TOOLS } from "./tools";
import type { CompletionResponse, Message } from "./types";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.AGENT_MODEL || "anthropic/claude-opus-4.5"; // Default from bootstrap.ts

export async function callLLM(
  messages: Message[],
): Promise<CompletionResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // We don't error here to allow tests to run without ENV,
  // but in prod it might fail if the API returns 401.

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      tools: TOOLS,
      reasoning: { max_tokens: 5000 },
      include_reasoning: true,
    }),
  });

  return response.json();
}
