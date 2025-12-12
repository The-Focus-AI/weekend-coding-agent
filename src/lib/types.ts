export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: any[];
  tool_call_id?: string;
  reasoning_details?: any; // OpenRouter/DeepSeek specific
  name?: string;
}

export interface CompletionResponse {
  choices: {
    message: Message;
  }[];
  error?: {
    message: string;
  };
}
