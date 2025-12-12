import type { CommandExecutor } from "./types";

export async function gitDiff(executor: CommandExecutor): Promise<string> {
  return executor("git diff");
}

export async function gitCommit(
  message: string,
  executor: CommandExecutor,
): Promise<string> {
  // Simple escaping. In a real app we might want more robust escaping using a library or array args if executor supported it.
  // escaping quotes in message
  const escapedMessage = message.replace(/"/g, '\\"');
  return executor(`git add . && git commit -m "${escapedMessage}"`);
}
