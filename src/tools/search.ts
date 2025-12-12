import { $ } from "bun";

export async function searchFiles(
  query: string,
  searchPath: string = ".",
  includeNodeModules: boolean = false,
): Promise<string> {
  try {
    // using grep -rn to find recursive, line number
    let result: string;
    if (includeNodeModules) {
      result = await $`grep -rn ${query} ${searchPath}`.text();
    } else {
      result =
        await $`grep -rn --exclude-dir=node_modules ${query} ${searchPath}`.text();
    }
    return result || "No matches found.";
  } catch (e: any) {
    // Grep returns exit code 1 if no matches found, which bun might catch as error
    if (e.exitCode === 1) return "No matches found.";
    return `Error searching files: ${e.stderr || e.message}`;
  }
}
