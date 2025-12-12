## Environment and Bootstrap Agent

1. Setupo mise to manage the environment
2. Install bun using mise
3. Get an `OPENROUTER_API_KEY` and put it in `.env`
4. Run the `bootstrap.ts` to make sure that it works.

### Mise

[mise](https://mise.jdx.dev/getting-started.html) is a way to setup a development environment on your local machine.  Once we do this, everything will be smoother.

Open up a terminal and run the following command:

```bash
curl https://mise.run | sh
```

You may need to restart your terminal after running the above command.

### Install bun

```bash
mise use bun
```

### Get openrouter key

Then we need to get an OPENROUTER_API_KEY.  You can do this on the [key page](https://openrouter.ai/settings/keys) and you'll need to create an account and add a credit card if necessary.

### Get bootstrap.ts

Copy the [smallest coding agent](https://thefocus.ai/recipes/smallest-coding-agent/) from thefocus.ai into `bootstrap.ts`.

I'm going to use `AGENT_MODEL=google/gemini-3-pro-preview` but feel free to use opus-4.5

Its a simple loop gives the model access to the `bash` tool, which is letting it call functions on your laptop.

### Test it out

Then we can start up our agent, and chat with it.

```bash
% bun run ./bootstrap.ts 
what files are in this directory?
Reasoning details: **Executing the Command**

I'm focusing on executing the `ls` command now. To get a clear view, I've decided to use `ls -F`. This will give me not just the file names, but also indicators for the file types, like the slash for directories. I want to make sure I quickly see what's what.


**Listing the Files**

I've successfully run the `ls -F` command. I'm now processing the output, aiming to present the file list to the user clearly. I'm considering the best way to format the output, perhaps adding some visual cues to enhance readability.



$ ls -F
bootstrap.ts
mise.toml
STEPS.md

The files in the current directory are:

*   `bootstrap.ts`
*   `mise.toml`
*   `STEPS.md`
```

Looks good!

---

## Project Scaffolding and Lint/Test

Lets start it up and flesh out our first agent.  We want take the bootstrap code and expand it into a more modular structure, we want to make sure that we have testing and linting to make sure that the code works, and we know that we are going to want to iterate on the system prompt.

> Take bootstrap.ts and convert it into a cleanly structured typescript project.  Use mise, bun and biome to control the building, running, testing, and linting of the project.  Split out the prompt so that we can iterate on it going forward.  Write tests for everything first, and make sure everythign passes.

And then

> run the linters and the tests to make sure everything passes.  make sure you have a test for the bash tool, make sure it can list all of the files in the directory

Start up the new agent and see how it works.  If its not working, go back to the bootstrap.ts agent and use that to debug it!  Just copy in any errors you see and it should work to resolve.

---

## Cost and Context Awareness

We need to keep track of which model we are running, and we need to see how much it costs, and how much these messages are costing it.

> Look up the model stats on startup, including name and cost.
> Log cost stats from the responses.
> Calculate message length, context size, and current cost.
> Display status after each message.

And we can test it out while making sure that things are more tested!

> update the prompt to always run linting and testing after each work unit, and make sure that everythign currently is tested

---

## Session logging

Lets record what we are doing, so we can use that information to do smarter things.

> Add session-logging functionality to the system. Create a jsonl file in .session_logs/ with the name the current date, like YYYY-MM-DD-HH-MM.jsonl that contains an entry for each message.  We'll use these files to examine and tune the system, and manage subsessions and session compactions and stuff like that.

---

## Add custom tools

> We need to add tools that are appropriate for navigating, editing, and varifying a code base.  Look through the existing tools.ts and look through the existing session_logs to see what could be improved, and suggest bunch of tools that we could build.  Ask me clarifying questions one at a time before we start to build anything.

```markdown
**Clarifying Question:**

For the **`edit_file`** capability, relying on "exact string matching" for search-and-replace can be brittle if the model hallucinates a single whitespace character.

**Would you prefer we implement a robust "search and replace" tool (requiring exact matches), or should we look into a "line-number based" editing tool (e.g., "replace lines 10-15 with X")?**
```

> is there a better diff style tool we could incorperate?

```markdown
For the **Execution/Verification** part (`run_command`), do you want to keep the raw `bash` tool (which effectively allows doing anything), or should we wrap specific common commands (like `git`, `check`, `test`) into their own typed tools to encourage safer behavior? (Keeping `bash` is most flexible but riskier).
```

> lets keep the bash tool for now, but make sure that it's used only as a last resort

```markdown
 I have implemented the suggested toolset for navigating, editing, and verifying the codebase.

### Changes Summary
1.  **Refactored `src/lib/tools.ts`**:
    *   Added **Navigation Tools**: `list_files`, `read_file`, `search_files`.
    *   Added **Editing Tools**:
        *   `write_file`: For creating new files.
        *   `replace_in_file`: A "smart diff" tool that replaces absolute blocks of text, ensuring uniqueness and safety (as requested).
    *   Added **Verification Tools**: `run_check` (runs tests/lint), `git_diff`.
    *   Kept `bash` as a fallback but discouraged its use in favor of structured tools.

2.  **Updated `src/agent.ts`**:
    *   Improved logging to display generic tool usage (e.g., `[Tool: read_file] path="..."`) instead of assuming every tool is a bash command.

3.  **Updated `src/prompts/system.ts`**:
    *   Revised the System Prompt to explicitly guide the agent on the "Explore -> Edit -> Verify" workflow using the new toolset.

4.  **Verification**:
    *   Ran `mise run check` to ensure all tests pass and code meets the style guidelines.

You can now use the agent to safely navigate and edit the codebase
```

> Also, lets make sure that we can handle multiple parallel tool calls


---

## Cleanup and Refactoring

> update the search tool in src so that it doesn't look throgh node_modules by default, only if specifically asked.  make sure that everything is property tested.  make sure that typechecking and lintig are run all of the time.  verify that we are showing reasoning specs, and verify that our usages totals are over the whole conversation

> Print the usage right after each of the responses, not before.

