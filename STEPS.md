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