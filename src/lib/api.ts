import { TOOLS } from "../tools/index";
import type { CompletionResponse, Message } from "./types";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const MODEL = process.env.AGENT_MODEL || "anthropic/claude-opus-4.5"; // Default from bootstrap.ts

export interface ModelStats {
  name: string;
  cost: {
    prompt: number;
    completion: number;
  };
}

let cachedStats: ModelStats | null = null;

export async function fetchModelStats(): Promise<ModelStats | null> {
  if (cachedStats) return cachedStats;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    const data = await response.json();
    const models = (data as any).data;
    const modelInfo = models.find((m: any) => m.id === MODEL);

    if (modelInfo) {
      cachedStats = {
        name: modelInfo.name,
        cost: {
          prompt: parseFloat(modelInfo.pricing.prompt) || 0,
          completion: parseFloat(modelInfo.pricing.completion) || 0,
        },
      };
      return cachedStats;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch model stats:", error);
    return null;
  }
}

export async function callLLM(
  messages: Message[],
  tools: any[] = TOOLS,
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
      tools: tools,
      reasoning: { max_tokens: 5000 },
      include_reasoning: true,
    }),
  });

  const data: CompletionResponse = await response.json();

  return data;
}
