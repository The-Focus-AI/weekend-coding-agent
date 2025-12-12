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

