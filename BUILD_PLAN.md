# Build Plan: Code-Editing Agent with Gemini 3

Based on the [ampcode article](https://ampcode.com/how-to-build-an-agent) and our research reports, this plan adapts the Go agent architecture to TypeScript using the Gemini 3 SDK.

## Overview

The ampcode article demonstrates that a functional code-editing agent requires just three things:
1. An LLM (Gemini 3 Pro)
2. A loop (conversation loop with tool execution)
3. Enough tokens (1M context window)

We'll build this in TypeScript with our researched stack: `tsx`, `vitest`, `@google/genai`, and `@tavily/core`.

## Current Directory State

The project already has:
- `mise.toml` - Basic mise configuration (needs tasks and env vars added)
- `.git/` - Git repository initialized
- `reports/` - Research documents from planning phase
- `BUILD_PLAN.md` - This file
- `STEPS.md` - Step-by-step guide
- `OUTPUT.txt` - Output reference

**Missing (to be created):**
- `.gitignore` - Node.js gitignore
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration
- `src/` - Source code directory

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Agent Loop                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1. Get user input                                │  │
│  │  2. Send message to Gemini with tools             │  │
│  │  3. If function call → execute tool → loop        │  │
│  │  4. If text response → display → wait for input   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      Tools                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  read_file   │  │  list_files  │  │  edit_file   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐                                       │
│  │  web_search  │  (optional - Tavily)                 │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
├── .gitignore             # Node.js ignores (to create)
├── mise.toml              # Node version + tasks (update existing)
├── package.json           # (to create)
├── tsconfig.json          # (to create)
├── vitest.config.ts       # (to create)
├── reports/               # (existing - research docs)
├── BUILD_PLAN.md          # (existing - this file)
├── STEPS.md               # (existing)
└── src/                   # (to create)
    ├── index.ts           # Entry point, CLI
    ├── agent.ts           # Agent class with conversation loop
    ├── tools/
    │   ├── index.ts       # Tool registry and executor
    │   ├── types.ts       # ToolDefinition interface
    │   ├── read-file.ts   # Read file tool
    │   ├── list-files.ts  # List directory tool
    │   ├── edit-file.ts   # Edit/create file tool
    │   └── web-search.ts  # Tavily search tool (optional)
    └── __tests__/
        ├── agent.test.ts
        └── tools.test.ts
```

## Implementation Steps

### Step 1: Project Setup

Set up git properly and initialize the TypeScript project, updating existing files where applicable.

**Step 1a: Create .gitignore**

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local
.env*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test artifacts
.test-sandbox/
coverage/

# Logs
*.log
npm-debug.log*
```

**Step 1b: Update mise.toml** (modify existing file)

Current mise.toml has:
```toml
[tools]
node = "latest"
"npm:@anthropic-ai/claude-code" = "latest"
```

Update to add environment and tasks (keep existing tools, add new sections):
```toml
[env]
_.path = ["./node_modules/.bin"]
GEMINI_API_KEY = "{{env.GEMINI_API_KEY}}"
TAVILY_API_KEY = "{{env.TAVILY_API_KEY}}"

[tools]
node = "22"
"npm:@anthropic-ai/claude-code" = "latest"  # Keep existing

[tasks.dev]
description = "Run agent in development mode"
run = "tsx src/index.ts"

[tasks.test]
description = "Run tests in watch mode"
run = "vitest"

[tasks.test-run]
description = "Run tests once"
run = "vitest run"

[tasks.typecheck]
description = "Type check"
run = "tsc --noEmit"
```

**Step 1c: Create package.json**:
```json
{
  "name": "agent",
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

**Step 1d: Install dependencies**:
```bash
npm install @google/genai @tavily/core
npm install -D typescript tsx vitest @types/node
```

**Step 1e: Create tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Step 1f: Create vitest.config.ts**:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

### Step 2: Tool Type Definitions

**Create src/tools/types.ts**:
```typescript
import { Type } from "@google/genai";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: typeof Type.OBJECT;
    properties: Record<string, {
      type: typeof Type.STRING | typeof Type.NUMBER | typeof Type.BOOLEAN;
      description: string;
    }>;
    required: string[];
  };
  execute: (args: Record<string, unknown>) => Promise<string>;
}
```

### Step 3: Implement Core Tools

Following the ampcode article's three essential tools.

**Create src/tools/read-file.ts**:
```typescript
import { Type } from "@google/genai";
import * as fs from "node:fs/promises";
import type { ToolDefinition } from "./types.js";

export const readFileTool: ToolDefinition = {
  name: "read_file",
  description: "Read the contents of a file at the given path. Use this to examine existing code before making changes.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The relative path to the file to read",
      },
    },
    required: ["path"],
  },
  async execute(args) {
    const path = args.path as string;
    try {
      const content = await fs.readFile(path, "utf-8");
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return `Error: File not found: ${path}`;
      }
      throw error;
    }
  },
};
```

**Create src/tools/list-files.ts**:
```typescript
import { Type } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ToolDefinition } from "./types.js";

export const listFilesTool: ToolDefinition = {
  name: "list_files",
  description: "List files and directories at the given path. Directories have a trailing slash.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The directory path to list. Defaults to current directory if empty.",
      },
    },
    required: [],
  },
  async execute(args) {
    const dirPath = (args.path as string) || ".";
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const result = entries
        .map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
        .sort()
        .join("\n");
      return result || "(empty directory)";
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return `Error: Directory not found: ${dirPath}`;
      }
      throw error;
    }
  },
};
```

**Create src/tools/edit-file.ts**:
```typescript
import { Type } from "@google/genai";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ToolDefinition } from "./types.js";

export const editFileTool: ToolDefinition = {
  name: "edit_file",
  description: "Edit a file by replacing old_str with new_str. If old_str is empty and file doesn't exist, creates a new file with new_str as content.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The file path to edit or create",
      },
      old_str: {
        type: Type.STRING,
        description: "The text to replace. Empty string to create new file.",
      },
      new_str: {
        type: Type.STRING,
        description: "The replacement text or content for new file.",
      },
    },
    required: ["path", "new_str"],
  },
  async execute(args) {
    const filePath = args.path as string;
    const oldStr = (args.old_str as string) || "";
    const newStr = args.new_str as string;

    try {
      const content = await fs.readFile(filePath, "utf-8");

      if (oldStr && !content.includes(oldStr)) {
        return `Error: old_str not found in file`;
      }

      const newContent = oldStr ? content.replace(oldStr, newStr) : newStr;
      await fs.writeFile(filePath, newContent, "utf-8");
      return "OK";
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT" && !oldStr) {
        // Create new file
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, newStr, "utf-8");
        return "OK (created new file)";
      }
      throw error;
    }
  },
};
```

### Step 4: Tool Registry

**Create src/tools/index.ts**:
```typescript
import type { ToolDefinition } from "./types.js";
import { readFileTool } from "./read-file.js";
import { listFilesTool } from "./list-files.js";
import { editFileTool } from "./edit-file.js";

export type { ToolDefinition };

export const tools: ToolDefinition[] = [
  readFileTool,
  listFilesTool,
  editFileTool,
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return tools.find((t) => t.name === name);
}

export function getToolDeclarations() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}
```

### Step 5: Agent Class

**Create src/agent.ts**:
```typescript
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
    this.model = config.model || "gemini-3-pro-preview";
    this.systemInstruction = config.systemInstruction || `You are a code editing assistant. You help users read, understand, and modify code files.

Available tools:
- read_file: Read file contents before making changes
- list_files: Explore directory structure
- edit_file: Make targeted edits to files

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

    let fullResponse = "";
    let functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
        fullResponse += chunk.text;
      }

      if (chunk.functionCalls) {
        functionCalls.push(...chunk.functionCalls.map(fc => ({
          name: fc.name,
          args: fc.args as Record<string, unknown>,
        })));
      }
    }

    // If there are function calls, execute them and continue
    if (functionCalls.length > 0) {
      for (const call of functionCalls) {
        yield `\n[Executing ${call.name}...]\n`;

        const tool = getToolByName(call.name);
        if (!tool) {
          yield `[Error: Unknown tool ${call.name}]\n`;
          continue;
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

          // Stream the follow-up response
          for await (const chunk of followUp) {
            if (chunk.text) {
              yield chunk.text;
            }

            // Handle nested function calls recursively
            if (chunk.functionCalls && chunk.functionCalls.length > 0) {
              for await (const nested of this.processMessage("")) {
                yield nested;
              }
            }
          }
        } catch (error) {
          yield `[Error: ${error}]\n`;
        }
      }
    }
  }
}
```

### Step 6: CLI Entry Point

**Create src/index.ts**:
```typescript
import * as readline from "node:readline";
import { Agent } from "./agent.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable required");
  process.exit(1);
}

const agent = new Agent({ apiKey });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(): void {
  rl.question("\nYou: ", async (input) => {
    const trimmed = input.trim();

    if (!trimmed || trimmed === "exit" || trimmed === "quit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    process.stdout.write("\nAgent: ");

    try {
      for await (const chunk of await agent.sendMessage(trimmed)) {
        process.stdout.write(chunk);
      }
      console.log();
    } catch (error) {
      console.error("\nError:", error);
    }

    prompt();
  });
}

console.log("Code Editing Agent (powered by Gemini 3)");
console.log("Type 'exit' to quit.\n");
prompt();
```

### Step 7: Tests

**Create src/__tests__/tools.test.ts**:
```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { readFileTool } from "../tools/read-file.js";
import { listFilesTool } from "../tools/list-files.js";
import { editFileTool } from "../tools/edit-file.js";

const TEST_DIR = ".test-sandbox";

describe("tools", () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("read_file", () => {
    it("reads existing file", async () => {
      await fs.writeFile(path.join(TEST_DIR, "test.txt"), "hello world");
      const result = await readFileTool.execute({ path: `${TEST_DIR}/test.txt` });
      expect(result).toBe("hello world");
    });

    it("returns error for missing file", async () => {
      const result = await readFileTool.execute({ path: `${TEST_DIR}/missing.txt` });
      expect(result).toContain("Error: File not found");
    });
  });

  describe("list_files", () => {
    it("lists directory contents", async () => {
      await fs.writeFile(path.join(TEST_DIR, "a.txt"), "");
      await fs.writeFile(path.join(TEST_DIR, "b.txt"), "");
      await fs.mkdir(path.join(TEST_DIR, "subdir"));

      const result = await listFilesTool.execute({ path: TEST_DIR });
      expect(result).toContain("a.txt");
      expect(result).toContain("b.txt");
      expect(result).toContain("subdir/");
    });
  });

  describe("edit_file", () => {
    it("replaces text in existing file", async () => {
      await fs.writeFile(path.join(TEST_DIR, "edit.txt"), "hello world");

      const result = await editFileTool.execute({
        path: `${TEST_DIR}/edit.txt`,
        old_str: "world",
        new_str: "universe",
      });

      expect(result).toBe("OK");
      const content = await fs.readFile(path.join(TEST_DIR, "edit.txt"), "utf-8");
      expect(content).toBe("hello universe");
    });

    it("creates new file when old_str is empty", async () => {
      const result = await editFileTool.execute({
        path: `${TEST_DIR}/new.txt`,
        old_str: "",
        new_str: "new content",
      });

      expect(result).toBe("OK (created new file)");
      const content = await fs.readFile(path.join(TEST_DIR, "new.txt"), "utf-8");
      expect(content).toBe("new content");
    });
  });
});
```

### Step 8: Optional Web Search Tool

**Create src/tools/web-search.ts**:
```typescript
import { Type } from "@google/genai";
import { tavily } from "@tavily/core";
import type { ToolDefinition } from "./types.js";

const apiKey = process.env.TAVILY_API_KEY;
const tvly = apiKey ? tavily({ apiKey }) : null;

export const webSearchTool: ToolDefinition = {
  name: "web_search",
  description: "Search the web for current documentation, code examples, or technical information. Use when you need up-to-date information beyond your training data.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query",
      },
    },
    required: ["query"],
  },
  async execute(args) {
    if (!tvly) {
      return "Error: TAVILY_API_KEY not configured";
    }

    const query = args.query as string;
    const response = await tvly.search(query, {
      searchDepth: "basic",
      maxResults: 5,
      includeAnswer: "basic",
    });

    let result = "";
    if (response.answer) {
      result += `Summary: ${response.answer}\n\n`;
    }
    result += "Sources:\n";
    result += response.results
      .map((r) => `- ${r.title}\n  ${r.url}\n  ${r.content.slice(0, 200)}...`)
      .join("\n\n");

    return result;
  },
};
```

To include web search, update **src/tools/index.ts** to add the import and tool:
```typescript
import { webSearchTool } from "./web-search.js";

export const tools: ToolDefinition[] = [
  readFileTool,
  listFilesTool,
  editFileTool,
  webSearchTool, // Add this
];
```

## Key Differences from ampcode Article

| Aspect | ampcode (Go) | Our Implementation (TypeScript) |
|--------|--------------|--------------------------------|
| LLM | Claude 3.7 Sonnet | Gemini 3 Pro |
| SDK | Anthropic Go SDK | @google/genai |
| Chat state | Manual conversation array | ai.chats handles automatically |
| Tool schema | jsonschema library | Gemini Type enum |
| Streaming | Not shown | Full streaming support |
| Web search | Not included | Tavily integration |

## Running the Agent

```bash
# Set API keys
export GEMINI_API_KEY="your-key"
export TAVILY_API_KEY="your-key"  # Optional

# Run
mise run dev

# Or directly
tsx src/index.ts
```

## Example Interaction

```
Code Editing Agent (powered by Gemini 3)
Type 'exit' to quit.

You: List all TypeScript files in the src directory

Agent: I'll list the files in the src directory for you.
[Executing list_files...]
[Result: agent.ts, index.ts, tools/...]

The src directory contains:
- agent.ts - Main agent class
- index.ts - CLI entry point
- tools/ - Directory with tool implementations

You: Read the agent.ts file

Agent: [Executing read_file...]
[Result: import { GoogleGenAI, Chat } from "@google/genai";...]

Here's the agent.ts file. It contains the Agent class that:
1. Initializes the Gemini client
2. Creates a chat session with tools configured
3. Processes messages and executes function calls
...

You: Add a method to reset the conversation

Agent: I'll add a reset method to the Agent class.
[Executing read_file...]
[Executing edit_file...]
[Result: OK]

Done! I've added a `reset()` method that clears the chat session:

```typescript
reset(): void {
  this.chat = null;
}
```

This allows you to start a fresh conversation while keeping the same agent instance.
```

## Next Steps After Basic Implementation

1. **Add more tools**: bash execution, grep/search, git operations
2. **Improve streaming UX**: Better progress indicators, colored output
3. **Add conversation persistence**: Save/load chat history
4. **Implement context management**: Summarize long conversations to stay within token limits
5. **Add safety guardrails**: Confirm destructive operations, sandbox file access

## Summary: Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `.gitignore` | **Create** | Node.js gitignore |
| `mise.toml` | **Update** | Add [env] and [tasks] sections, keep existing tools |
| `package.json` | **Create** | Project manifest |
| `tsconfig.json` | **Create** | TypeScript config |
| `vitest.config.ts` | **Create** | Test config |
| `src/index.ts` | **Create** | CLI entry point |
| `src/agent.ts` | **Create** | Agent class |
| `src/tools/types.ts` | **Create** | Tool type definitions |
| `src/tools/index.ts` | **Create** | Tool registry |
| `src/tools/read-file.ts` | **Create** | Read file tool |
| `src/tools/list-files.ts` | **Create** | List files tool |
| `src/tools/edit-file.ts` | **Create** | Edit file tool |
| `src/tools/web-search.ts` | **Create** | Web search tool (optional) |
| `src/__tests__/tools.test.ts` | **Create** | Tool tests |

**Existing files preserved:**
- `reports/` - Research documents
- `BUILD_PLAN.md` - This plan
- `STEPS.md` - Step guide
- `OUTPUT.txt` - Output reference
- `.git/` - Git repository
- `.claude/` - Claude config
