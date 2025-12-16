# Build Your Own AI Coding Assistant in a Weekend

A hands-on tutorial for building a working AI coding agent from scratch. No frameworks, no magic—just the primitives you need to understand how tools like Cursor, Claude Code, and Copilot Workspace actually work under the hood.

## What You'll Build

By the end of this tutorial, you'll have a fully functional AI coding assistant that can:

- Navigate and understand your codebase
- Edit files with precision using structured diff tools
- Run tests and linting to verify changes
- Search the web for documentation and solutions
- Spawn specialized sub-agents for focused tasks
- Track costs so you don't blow your API budget
- Log sessions for debugging and improvement

More importantly, you'll understand *why* each piece exists and *how* they fit together.

## Why Build This?

AI coding assistants feel like magic. They're not. They're loops.

Every agent—from ChatGPT's code interpreter to Claude Code to Devin—follows the same basic pattern: take a prompt, maybe call some tools, return a response, repeat. The difference between a toy and a production system is everything else: safety, cost management, context handling, observability, and extensibility.

This tutorial peels back the layers. You'll start with a 50-line bootstrap script and progressively add the pieces that turn it into something you'd actually trust with your code.

## The Journey

### Part 1: The Bootstrap Loop

**What you'll build**: A minimal script that connects an LLM to your terminal.

**Why it matters**: This is the "aha" moment. Once you see that an agent is just a while loop with an API call and a tool executor, everything else makes sense. The mystique evaporates, replaced by understanding.

**Concepts introduced**:
- The chat completions API and message format
- Tool/function calling—how models request actions
- The agent loop: prompt → response → tool execution → repeat
- Why streaming matters for user experience

**What you'll learn**: The entire agent pattern fits in your head. Everything after this is refinement.

---

### Part 2: Project Structure

**What you'll build**: A properly organized TypeScript project with tests, linting, and a clean module structure.

**Why it matters**: You're about to iterate rapidly. Without structure, you'll lose track of what works. Without tests, you'll break things and not know it. Without linting, you'll waste time on typos and formatting. Professional tooling isn't overhead—it's how you move fast without breaking things.

**Concepts introduced**:
- Bun as a fast, modern JavaScript runtime
- Biome for linting and formatting (faster than ESLint + Prettier)
- Test-driven development for AI tools
- Separating prompts from logic for easy iteration

**What you'll learn**: How to structure an agent project so you can change one piece without breaking others.

---

### Part 3: Cost & Context Awareness

**What you'll build**: Real-time tracking of token usage, model costs, and context window consumption.

**Why it matters**: LLM calls cost real money. Context windows have hard limits. Without measurement, you'll either:
- Go broke during development
- Hit silent failures when context overflows
- Have no idea why some sessions cost $0.02 and others cost $2.00

Production agents need observability. This is where you add it.

**Concepts introduced**:
- Token counting and estimation
- Model pricing lookups via OpenRouter
- Context window management
- Displaying running totals to users

**What you'll learn**: How to build agents you can afford to run, and how to know when you're approaching limits.

---

### Part 4: Session Logging

**What you'll build**: Automatic logging of every message, tool call, and response to structured JSONL files.

**Why it matters**: Debugging agents is hard. "Why did it delete that file?" or "Why did it get stuck in a loop?" are unanswerable questions without logs. Good logging enables:
- **Debugging**: Replay any session to see exactly what happened
- **Cost audits**: Track spending over time
- **Regression testing**: Compare behavior before and after changes
- **Training data**: Your logs become fine-tuning material
- **Analytics**: Understand how the agent is actually being used

**Concepts introduced**:
- Structured logging with JSONL format
- Session identification and organization
- Timestamp-based file naming
- Logging tool calls vs. responses vs. user messages

**What you'll learn**: How to make agent behavior inspectable and reproducible.

---

### Part 5: Structured Tools

**What you'll build**: Purpose-built tools that replace raw bash access—`read_file`, `search_files`, `replace_in_file`, `run_check`, and more.

**Why it matters**: Giving an LLM raw bash access is like giving a toddler a chainsaw. It might work, but the failure modes are catastrophic. Structured tools provide:
- **Safety**: Can't `rm -rf /` through a `read_file` tool
- **Predictability**: Consistent input/output formats
- **Validation**: Check parameters before execution
- **Logging**: Clean records of what was actually done
- **Guidance**: Tool names and descriptions steer the model toward good patterns

**Concepts introduced**:
- Tool design principles—what makes a good tool
- The "Explore → Edit → Verify" workflow
- Parallel tool execution for speed
- Keeping bash as a fallback, not a default
- Response size limits to protect context

**What you'll learn**: How to give agents capabilities without giving them footguns.

---

### Part 6: The Prompt System

**What you'll build**: Multiple prompt "personalities" with different instructions, tool access, and behaviors.

**Why it matters**: One prompt can't do everything well. A prompt optimized for careful code review gives different instructions than one optimized for rapid prototyping. Separating prompts lets you:
- Tune each personality for its specific job
- Restrict tool access based on task (research agents don't need file editing)
- Keep instructions focused instead of bloated
- A/B test different approaches

**Concepts introduced**:
- System prompts as agent configuration
- Prompt templates with dynamic content
- Tool access control per prompt
- Separation of concerns in agent design

**What you'll learn**: How to create specialized agents that excel at specific tasks.

---

### Part 7: Subagents

**What you'll build**: The ability for your main agent to spawn child agents with focused tasks and limited scope.

**Why it matters**: Context is precious and expensive. When you need deep research on a topic or a complex multi-file refactor, you don't want to pollute your main conversation with all that detail. Subagents let you:
- **Isolate context**: Child agents work in their own context window
- **Parallelize**: Multiple subagents can work simultaneously
- **Specialize**: Use different prompts/models for different subtasks
- **Summarize**: Return just the results, not the journey

This is how you handle tasks that would otherwise overflow your context.

**Concepts introduced**:
- Agent orchestration patterns
- Parent-child agent communication
- Task decomposition strategies
- When to spawn vs. when to continue inline
- Subagent logging and tracing

**What you'll learn**: How to break complex tasks into manageable pieces and coordinate multiple agents.

---

### Part 8: Web Tools

**What you'll build**: URL-to-markdown conversion and web search integration via Tavily.

**Why it matters**: Your agent shouldn't be limited to local files. The web contains documentation, Stack Overflow answers, API references, and current information your model's training data doesn't have. Web tools enable:
- Looking up library documentation
- Researching unfamiliar technologies
- Finding solutions to error messages
- Staying current with changing APIs

**Concepts introduced**:
- Content extraction and cleanup (HTML → Markdown)
- Search API integration
- Handling web content size for context limits
- When to search vs. when to use training knowledge

**What you'll learn**: How to extend your agent's knowledge beyond its training cutoff.

---

### Part 9: Skills System

**What you'll build**: A plugin architecture where skills are markdown files with frontmatter metadata, loaded on demand.

**Why it matters**: You can't anticipate every task. Hard-coding capabilities leads to bloated prompts and rigid systems. A skills system lets you:
- **Extend without modifying**: Add new capabilities as files, not code changes
- **Load on demand**: Only pay context cost when a skill is actually needed
- **Self-document**: Skills describe their own usage and triggers
- **Share and reuse**: Skills are portable between projects

**Concepts introduced**:
- Plugin architecture for agents
- Frontmatter as metadata (YAML in markdown)
- Dynamic capability discovery
- Lazy loading to manage context
- The skill lifecycle: detect → load → execute

**What you'll learn**: How to build agents that grow with your needs.

---

## What You'll Understand After

By the end of this tutorial, you won't just have working code—you'll have mental models:

- **Agents are loops**: The core pattern is simple. Complexity comes from handling edge cases well.
- **Tools are the interface**: Good tool design is the difference between helpful and dangerous.
- **Context is the constraint**: Everything in agent design traces back to managing finite context.
- **Observability isn't optional**: If you can't see what happened, you can't fix what went wrong.
- **Extensibility requires architecture**: Ad-hoc additions become unmaintainable fast.
- **Safety and capability trade off**: More power means more risk. Design accordingly.

---

## Further Explorations

Once you've built the core agent, here are paths to explore:

### Connect Directly to Model Providers

Skip OpenRouter and connect directly to the source:

| Provider | Why Consider It |
|----------|-----------------|
| **Anthropic API** | Direct Claude access, prompt caching, lower latency |
| **Google AI Studio** | Gemini models, generous free tier, multimodal capabilities |
| **OpenAI API** | GPT models, extensive ecosystem, fine-tuning options |

Trade-off: Direct connections mean managing multiple API keys and SDKs, but you get provider-specific features and potentially lower costs.

### Memory & Persistence

| Approach | What to Explore |
|----------|-----------------|
| **Vector databases** | Pinecone, Chroma, or pgvector for semantic search over past conversations |
| **RAG patterns** | Retrieve relevant context before generating responses |
| **Long-term memory** | Remember user preferences and project context across sessions |
| **Episodic memory** | "Remember when we fixed that bug last week?" |

### Multi-Model Strategies

| Strategy | When to Use |
|----------|-------------|
| **Model routing** | Cheap models for simple tasks, expensive ones for complex reasoning |
| **Cascade patterns** | Try fast model first, fall back to powerful model if confidence is low |
| **Ensemble approaches** | Multiple models vote on critical decisions |
| **Specialized models** | Code models for code, general models for planning |

### Security & Sandboxing

| Technique | What It Provides |
|-----------|------------------|
| **Docker isolation** | Run tools in containers that can't touch your real filesystem |
| **Permission systems** | Require approval for dangerous operations |
| **Capability tokens** | Limit what each session can access |
| **Audit logging** | Track every action for security review |

### User Experience

| Feature | Implementation Ideas |
|---------|---------------------|
| **Streaming responses** | Show partial output as it generates |
| **Progress indicators** | "Searching 47 files..." feedback |
| **Human-in-the-loop** | Approval workflows for destructive changes |
| **Undo/rollback** | Git-based recovery from mistakes |
| **Voice interface** | Speech-to-text input, text-to-speech output |

### Advanced Architectures

| Pattern | What to Research |
|---------|------------------|
| **MCP Integration** | Connect to the Model Context Protocol ecosystem |
| **Team agents** | Multiple agents collaborating with different roles |
| **Planning agents** | Separate planning from execution |
| **Self-improvement** | Agents that update their own prompts and skills based on feedback |
| **Evaluation loops** | Automated testing of agent behavior |

---

## Prerequisites

Before starting, you should have:

- **Basic TypeScript/JavaScript**: You can read and modify TS code
- **Terminal comfort**: You use the command line regularly
- **An OpenRouter API key**: Sign up at [openrouter.ai](https://openrouter.ai), add ~$10-20 credit
- **A weekend**: Each part takes 1-3 hours depending on how deep you go

---

## Getting Started

```bash
# Install mise for environment management
curl https://mise.run | sh

# Clone this repository
git clone <repo-url>
cd weekend-coding-agent

# Let mise set up your environment
mise install

# Copy the environment template and add your API key
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Start with Part 1
bun run ./bootstrap.ts
```

---

## Project Structure

```
weekend-coding-agent/
├── bootstrap.ts          # Part 1: The minimal agent
├── src/
│   ├── agent.ts          # Core agent loop
│   ├── lib/
│   │   ├── tools.ts      # Tool implementations
│   │   ├── models.ts     # Model and cost tracking
│   │   └── logger.ts     # Session logging
│   └── prompts/          # Prompt personalities
├── skills/               # Extensible skills system
├── docs/                 # Generated documentation
├── .session_logs/        # Conversation logs (gitignored)
└── STEPS.md              # Detailed step-by-step instructions
```

---

## License

MIT - Build something cool.

---

## Acknowledgments

This tutorial was built with the assistance of AI coding agents—eating our own dog food. The session logs from building this project informed many of the design decisions documented here.
