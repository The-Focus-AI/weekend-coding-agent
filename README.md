# Build Your Own AI Coding Assistant in a Weekend

Ever wonder exactly how vibe coding works?  Lets learn how to build a coding agent *without writing a single line of code*.

This tutorial will get you right into the core loop of how software agents work.  All you need is a terminal (available free with your computer) and an openrouter api access key to get access to a model.

We'll walk you through how to bootstrap the environment, get the agent up and running, and then add a whole lot of features.  The trick here is that we are going to use this agent to build itself, and we'll go through all of the commands you'll copy and paste over to direct it's development.

No frameworks, no magic, just the primitives you need to understand how tools like Cursor and Claude Code work under the hood, and to get a good feeling for what the different models can do.

As of this writing, this works best with Gemini 3 or Opus 4.5.  But if you want to expirement with something else, you can easily swap out the model and see how it goes.

## What You'll Build

By the end of this tutorial, you'll have a fully functional AI coding assistant that can:

- Navigate and understand your codebase
- Edit files with precision using structured diff tools
- Support user defined custom skills to extend functionality
- Self monitor the quality of it's code base
- Generate images and videos
- Search the web for documentation and solutions
- Spawn specialized sub-agents for focused tasks
- Track costs so you don't blow your API budget
- Log sessions for debugging and improvement

More importantly, you'll understand *why* each piece exists and *how* they fit together.  And you'll be able to do it just using english prompts, an honestly reading the code is almost optional at this point.

Crazy.

## Why Build This?

There's a fear out there about how intellectual work will change now that we have intelligence on tap.  People have valid concerns, but most of the arguments I see are borne out of fear and ignorance, and so I wanted to make a tutorial that everyone could go through to get some hands-on experience on what these tools can literally do, and how that fits into your working process.

With this tutorial you can join me in step-by-step building of a piece of software, one **that is smart enough to build itself**.  I'm going to give you the prompts -- which means that I thought up what to ask it to do, I have an idea of what we are going to build and how it's going to work.  

If you aren't an experienced software-engineer you wouldn't have known what to ask it to do, and honestly our understanding of how to best use these tools is evolving daily.  **But you can follow along with what I'm doing, and you can do it your self, and you don't especially need to read code anymore.**

Whats exciting to me is not really how much easier by job is -- or how I can now operate even closer to the things of thought-stuff -- but many more people can now opereate *closer to the thought-stuff of software*, to the poetry of coding.

![wage slaves](./images/ai_newspaper.png)

These techniques will help you solve the sorts of problems that you needed to be a coder to solve.  If those solutions delivered value before, now it will be in your power to make that value.  And even if you don't end up coding your whole world, this will help you develop some [fingerspitzengefühl](https://en.wikipedia.org/wiki/Fingerspitzengef%C3%BChl) for these new tools can do.

This tutorial peels back the layers. You'll start with a 50-line bootstrap script that captures the core of what an agent is and then build everything out.

## How Agents Actually Work

Before diving in, let's demystify what's happening under the hood. Every AI coding assistant—Cursor, Claude Code, Copilot, or what we're building—follows the same pattern.

### The Agent Loop

It's a loop.  You say something, the LLM responses, if it asks for a tool you run it, and the loop goes around and around.

1. User Enters input
2. Send to the LLM
3. LLM Runs the simulation, returns tokens
3a. Includes tool call? Call the tool, go back to step #2
4. Shows the result to the user
5. Go to step 1.


That's it. The "AI" part is the LLM. Everything else is plumbing.

### The Harness: Prompts + Tools + Model

What we are building here is called **a harness**.  This is a combination of **a prompt**, **tools**, and a **model**.  Think of it as three layers working together:

| Layer | What It Is | What It Does |
|-------|-----------|--------------|
| **Model** | The LLM (Claude, GPT, Gemini) | The "brain"—understands intent, generates responses, decides what tools to call |
| **Tools** | Functions the model can invoke | The "hands"—read files, run commands, search the web |
| **Prompts** | Instructions shaping behavior | Clear directions on what you want the agent to do |

The model is powerful but blind—it can't see your filesystem or run code. Tools give it capabilities. Prompts tell it how to use them wisely.

This combination is the **harness**. Swap the model, and the same harness behaves differently. Change the prompts, and the same model acts differently. Add tools, and new capabilities emerge.

### Key Concepts

**Tool Calling** — Modern LLMs don't just output text. They can output structured requests like "call the `read_file` function with path `/src/index.ts`". Your code executes that function and sends the result back. The model never actually runs anything—it just asks.

**Context Window** — The LLM's working memory. Every message, every tool result, every instruction competes for space in a fixed-size window (typically 128K-200K tokens). When you cross that limit, things get stupid. **Managing context is the central challenge of agent design.**

**System Prompt** — Instructions on what you want the agent to do.  What sorts of responses are you looking for?  Do you want it to be especially terse, or complete and have all of it's responses fix a clear template?  You tweak that here, and a coding agent will have multiple prompts for what you need to do.

**Streaming** — Instead of waiting for the full response, you receive tokens as they're generated. This is why you see AI assistants "typing"—it's not theater, it's the actual generation happening in real-time.

### What Makes a Good Agent?

The model.  99% the model.

### No really

Yes really.

### Ok but..

The differences are in the harness, and how cleverly you can manage context.

- **Good context** -- Making sure it understands your problem, where you are with it, what needs to happen.
- **Good tools** — Safe, predictable, well-described so the model knows when to use them
- **Good prompts** — Clear instructions that guide without over-constraining
- **Good observability** — Logging and cost tracking so you know what's happening
- **Good architecture** — Context management, subagents for complex tasks, extensibility

That's what we're building.

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

## Lets go!

