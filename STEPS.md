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

---

## Prompting

The ability for the main agent to call an subagent is a great way to manage context. 

First lets clean up some tool things so keep things under control:


> look through the tools implementations and make sure that it's clean, and make sure that we are using ripgrep for searching

> add a limit to the size of the response for search_files to make sure that it doesn't return more than 50 lines.  also add a 500 line limit to read_file and add some offset parameters to it.   remove git commit command also

Now that's done, lets add a better prompt system:

> Clean up the prompt system.  We want to support multiple prompts, for example code-explorer, or feature-planner, or tech-researcher, that will have access to different tools and write out different results.  Each prompt should have a description describing what it's approprate, and a list of tools that is has access to.  We want to add a sub-prompt tool that will create a new agent with a detailed message, and then the agent can return the result or ask for more equestions

---

## Subagents: code-map

Lets write a prompt that will help map out what is in the code base.

> Create a code explorer agent that is in the prompt directory.  You will write out a very detailed prompt that can be run over and over again.  The prompt looks through the entire codebase, and documents it.  The format should be structured and optimized for LLMs to read it to focus on adding and refactoring code to keep it clean as possible.  It should be in file called docs/YYYY-MM-DD-code-map.md with prompt markdown frontmatter.  There should be a 2 sentence summary, then it should explain the high level architecture, then each of the main modules.  If there are any pressing security or other code quality issues -- such as poor test converage -- then those should be documetned by priority.  After that, if there's a database, document the datamodel.  If it's a typed language, document the types and where they are defined.  After that, it should go through each source and test file specifiying what methods (with type signatures) are in each file, and how they files are interlated.  Be sure that this prompt can easily be run as a subagent.  Ask me clarifying questions one at a time.

> Integrate the prompt system with the subagent system, and make sure that the list of prompts, subagents, and tools is dynamically specified for each prompt.  Also, we don't need code-explorer and code-map as a spereate thing.

> examine the log system and make sure that entries are logged immediately after response, and that we are corrctly tracking how subagent logs map to the parent agent

---

## Tools: Searching

> Add a tool that uses markify or similar to download a url and convert it to markdown

If that seems good, lets add a better search

> Add tavily search as a tool

Then in a new instance:

> use the tavily search engine tool to look up best practices on how to use tavily, and then updte the tavily.ts search tool

Now we can give it a go:

And finally lets update the tech report agent.

---

## Agents and Skills

Skills are awesome.  They have front matter on when they run, and then they can include a whole bunch more information that only gets loaded up when the skill is activated.

Lets build it.

> We want to add "skills" to the system.  Create a skills directory, and inside of that have a bunch of directories with skills in them.  Each will have a SKILLS.md file, and there's front matter thant describes how to user it.  Have all the sysetm prompts include that front matter in them with instrutions that when you need to do a task, load in the rest of the SKILLS.md that examplains how it do it.  This system should also load in all the front matter of the agents, so that each agent will have access to all of them.  Have an example skill called big text that called figlet to make a banner.

Lets also make sure that we aren't doing anything silly with agents.

> i want to make sure that no tools, agents, or skills are hard coded inside of the agent prompt and are driven by meta data

> update the big_text SKILLS to use examples of each of the different fonts and make sure that you are extremely complete

---

## Images and Video

Go grab yourself an google gemini key and we're going to teach this agent to make files and videos.

> Add 2 skills, one to generate images and the other to generate videos.  Use the "npx @the-focus-ai/nano-banana" command, and look through how it works before writing out the skill.  do some research first on the best ways to prompt these models, and incorperate your findings in the skill

Lets test:

> make an image of diagraming the STEPS.md file

Here we go:

![diagram](images/steps_diagram.png)

>  make a 720p 8 second video animating that image

Skills are super useful as you can see -- we are teaching it how to use a CLI in this case, and it comes with very very additional tokens in the context window.

