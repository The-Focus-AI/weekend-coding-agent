# Environment Setup

We are going to use Mise to setup our environment.

[mise](https://mise.jdx.dev/getting-started.html) is a way to setup a development environment on your local machine.  Once we do this, everything will be smoother.

Open up a terminal and run the following command:

```bash
curl https://mise.run | sh
```

You may need to restart your terminal after running the above command.

Run `mise doctor` to check if your environment is setup correctly.

This will install Mise and then prompt you to create a project.  Let's create a project called `my-project`.

## Create your workspace

```bash
mkdir my-project
cd my-project
git init
```

## Install node & claude-code

```bash
mise use node@latest
```

And then

```bash
mise use npm:@anthropic-ai/claude-code
```

Now you should be able to start up claude:

```bash
claude
```

---

# Make a researching tool

We are going to build some meta tools tool that will help us to some work.

> Write a prompt for a research agent that searches the internet based upon the current technologies and choices that have been made in the project to find the best techniques or libraries of doing something, and finds the best choice base upon simplicity, popularity, good support. It should output its findings in reports/yyyy-mm-dd-topic.md and it should have front matter saying when it's appropriate or not to use.  It should explain how to use the library or software, the theory behind it and its basic usage philosphy.  The first part of the report will give a short explaination of what you've found, then it should go into detail on how to use it (incuding setup and code examples), and finally it should have a caviats section at the bottom saying when its not right.  It should include a bibliography of sources it used that can be followed for more information, and the report should be annotated where it get information.  Ask me clarifing questions one at time before going writing the research prompt

It asked me a bunch of questions, which you can see in OUTPUT.txt and finally it returns

```bash
Done. I created the research agent prompt at .claude/commands/research.md.

  Key features:

  1. Project introspection - Automatically examines package.json, pyproject.toml, etc. to understand the tech stack
  2. 2-3 targeted questions - Asks discriminating questions that maximally reduce uncertainty
  3. Definitive recommendation - Outputs ONE best choice, not a comparison
  4. LLM-optimized format - Clear structure, explicit patterns, anti-patterns section
  5. Numbered footnotes - Every claim annotated with [1] style references
  6. YAML front matter - Includes use_when and avoid_when arrays for quick scanning

  Usage:
  /research how to do form validation
  /research state management for complex forms
  /research authentication strategy

  The report will be saved to reports/YYYY-MM-DD-descriptive-topic.md with sections for Summary, Philosophy, Setup, Core Usage
  Patterns, Anti-Patterns & Pitfalls, Caveats, and References.
```

---

# Teach it how to setup TypeScript projects

Now that we have that, we can clear the session, or create a new thread, and start using the prompt.  `/clear`

> /research the most modern and clean way to setup a typescript project in november 2025 when you are using mise for environment management, I want it to be as simple as possible

Clarifying questions

> we are going to build a cli coding agent and want testing 

It thinkgs for a more than 3 minutes and finally:

```bash
Research Complete

  I've written the report to reports/2025-11-28-typescript-project-setup.md.

  Recommendation: tsx + Vitest

  The simplest modern setup for a CLI coding agent:

  | Tool   | Purpose             | Why                                                                         |
  |--------|---------------------|-----------------------------------------------------------------------------|
  | tsx    | Run TypeScript      | Zero-config, instant execution, 11.6k GitHub stars                          |
  | Vitest | Testing             | Native TS support, Jest-compatible API, 15.4k stars, 18.5M weekly downloads |
  | tsc    | Type checking       | Run separately in CI/pre-commit                                             |
  | mise   | Tasks + environment | Already have it, replaces npm scripts                                       |

  Quick Start

  npm init -y
  npm install -D typescript tsx vitest @types/node

  Update mise.toml:
  [env]
  _.path = ["./node_modules/.bin"]

  [tools]
  node = "22"

  [tasks.dev]
  run = "tsx watch src/index.ts"

  [tasks.test]
  run = "vitest"

  [tasks.typecheck]
  run = "tsc --noEmit"

  Why not Node.js native TypeScript?

  While Node 22+ supports TypeScript natively via type stripping, it has limitations: no enums without extra flags, no tsconfig
  features like path aliases, and it's still experimental for production. tsx "just works" with zero config.
```
