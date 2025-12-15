import type { CommandExecutor } from "./types";

export async function gitDiff(executor: CommandExecutor): Promise<string> {
  return executor("git diff");
}
