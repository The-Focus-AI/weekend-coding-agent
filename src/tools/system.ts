import { $ } from "bun";
import type { CommandExecutor } from "./types";

// Default executor using Bun Shell
export const defaultBashExecutor: CommandExecutor = async (command: string) => {
  try {
    const result = await $`sh -c ${command}`.text();
    return result;
  } catch (e: any) {
    return e.stderr || e.message || "Unknown error";
  }
};

export async function runBash(
  command: string,
  executor: CommandExecutor = defaultBashExecutor,
): Promise<string> {
  return executor(command);
}
