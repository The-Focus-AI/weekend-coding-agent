import * as fs from "node:fs";
import * as path from "node:path";
import { TOOLS } from "../tools";

export interface Prompt {
  name: string;
  description: string;
  systemPrompt: string;
  tools: any[];
}

function parseFrontMatter(content: string): {
  metadata: Record<string, any>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: content };
  }

  const metadataRaw = match[1];
  const body = match[2];
  const metadata: Record<string, any> = {};

  for (const line of metadataRaw.split("\n")) {
    const [key, ...values] = line.split(":");
    if (key && values.length > 0) {
      let value = values.join(":").trim();
      // Handle simple array parsing [a, b, c]
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim());
      }
      metadata[key.trim()] = value;
    }
  }

  return { metadata, body };
}

import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadPrompts(): Record<string, Prompt> {
  const promptsDir = __dirname;
  const prompts: Record<string, Prompt> = {};
  const files = fs.readdirSync(promptsDir);

  for (const file of files) {
    if (path.extname(file) === ".md") {
      const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
      const { metadata, body } = parseFrontMatter(content);

      if (!metadata.name) continue;

      const toolNames = (metadata.tools as string[]) || [];
      const subagentNames = (metadata.subagents as string[]) || [];

      const promptTools = TOOLS.filter((t) =>
        toolNames.includes(t.function.name),
      );

      if (subagentNames.length > 0) {
        promptTools.push({
          type: "function",
          function: {
            name: "run_agent",
            description: "Delegate a task to a specialized subagent",
            parameters: {
              type: "object",
              properties: {
                agentName: {
                  type: "string",
                  enum: subagentNames,
                  description: "The name of the subagent to run",
                },
                task: {
                  type: "string",
                  description: "The task description for the subagent",
                },
              },
              required: ["agentName", "task"],
            },
          },
        });
      }

      prompts[metadata.name] = {
        name: metadata.name,
        description: metadata.description || "",
        systemPrompt: body.trim(),
        tools: promptTools,
      };
    }
  }
  return prompts;
}

// Cache prompts
let PROMPTS_CACHE: Record<string, Prompt> | null = null;

export function getPrompt(name: string): Prompt {
  if (!PROMPTS_CACHE) {
    PROMPTS_CACHE = loadPrompts();
  }
  return PROMPTS_CACHE[name] || PROMPTS_CACHE.default;
}
