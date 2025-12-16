import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadSkills(): string {
  const skillsDir = path.join(process.cwd(), "skills");
  if (!fs.existsSync(skillsDir)) return "";

  const skills = fs
    .readdirSync(skillsDir)
    .map((dir) => {
      const skillPath = path.join(skillsDir, dir, "SKILL.md");
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, "utf-8");
        const { metadata } = parseFrontMatter(content);
        return { dir, ...metadata };
      }
      return null;
    })
    .filter((s): s is Record<string, any> => s !== null);

  if (skills.length === 0) return "";

  let output = "\n\n# Available Skills\n";
  output +=
    "The following skills are available. Their frontmatter is listed below. If you need to perform a task related to one of these skills, you MUST read the full instruction file at `skills/<skill_directory>/SKILL.md` using the `read_file` tool.\n\n";

  skills.forEach((s) => {
    output += `- Name: ${s.name || s.dir}\n`;
    if (s.description) output += `  Description: ${s.description}\n`;
    output += `  Path: skills/${s.dir}/SKILL.md\n`;

    // Include all other metadata from frontmatter
    for (const [key, val] of Object.entries(s)) {
      if (key !== "name" && key !== "description" && key !== "dir") {
        output += `  ${key}: ${val}\n`;
      }
    }
    output += "\n";
  });

  return output;
}

function loadPrompts(): Record<string, Prompt> {
  const promptsDir = __dirname;
  const prompts: Record<string, Prompt> = {};
  const files = fs.readdirSync(promptsDir);

  const rawPrompts = [];

  // First pass: Read all prompt files
  for (const file of files) {
    if (path.extname(file) === ".md") {
      const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
      const { metadata, body } = parseFrontMatter(content);

      if (metadata.name) {
        rawPrompts.push({ metadata, body });
      }
    }
  }

  // Build Agents Summary
  let agentsSummary = "\n\n# System Agents\n";
  agentsSummary += "The following agents exist in the system:\n\n";
  rawPrompts.forEach((p) => {
    agentsSummary += `- Name: ${p.metadata.name}\n`;
    if (p.metadata.description)
      agentsSummary += `  Description: ${p.metadata.description}\n`;
    // Include other metadata
    for (const [key, val] of Object.entries(p.metadata)) {
      if (
        key !== "name" &&
        key !== "description" &&
        key !== "tools" &&
        key !== "subagents"
      ) {
        agentsSummary += `  ${key}: ${val}\n`;
      }
    }
    agentsSummary += "\n";
  });

  // Build Skills Summary
  const skillsSummary = loadSkills();
  const commonContext = agentsSummary + skillsSummary;

  // Second pass: Create Prompt objects
  for (const p of rawPrompts) {
    const toolNames = (p.metadata.tools as string[]) || [];
    const subagentNames = (p.metadata.subagents as string[]) || [];

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

    let toolUsage = "\n\n# Available Tools\n";
    toolUsage += "You have access to the following tools:\n";
    promptTools.forEach((t) => {
      toolUsage += `- ${t.function.name}: ${t.function.description}\n`;
    });

    prompts[p.metadata.name] = {
      name: p.metadata.name,
      description: p.metadata.description || "",
      systemPrompt: p.body.trim() + toolUsage + commonContext,
      tools: promptTools,
    };
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
