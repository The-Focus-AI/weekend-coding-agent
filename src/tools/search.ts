import { $ } from "bun";

export async function searchFiles(
  query: string,
  searchPath: string = ".",
  includeNodeModules: boolean = false,
): Promise<string> {
  try {
    // using ripgrep (rg)
    let result: string;

    // Construct rg arguments
    // -n: line number
    // --no-heading: group matches by line, not file header (like grep -n)
    const args = ["-n", "--no-heading"];

    if (includeNodeModules) {
      // -u: unrestricted (ignores .gitignore)
      // This will include node_modules if it's gitignored.
      // If we want to be very specific about node_modules, typically --no-ignore is enough if node_modules is in .gitignore
      // If node_modules is hidden, we might need -uu
      // Standard for "include everything" is usually -u or --no-ignore
      args.push("-u");
    }

    // searchPath defaults to "."
    // query is the pattern

    // Note: $`rg ${args} ${query} ${searchPath}` requires careful array spreading in bun shell if args is an array
    // simpler to build the command string or pass flags directly if logic is simple.

    if (includeNodeModules) {
      result = await $`rg -n --no-heading -u ${query} ${searchPath}`.text();
    } else {
      result = await $`rg -n --no-heading ${query} ${searchPath}`.text();
    }

    const lines = result.trim().split("\n");
    if (lines.length > 50) {
      return (
        lines.slice(0, 50).join("\n") +
        `\n... (and ${lines.length - 50} more matches)`
      );
    }

    return result || "No matches found.";
  } catch (e: any) {
    // rg returns exit code 1 if no matches found
    if (e.exitCode === 1) return "No matches found.";
    return `Error searching files: ${e.stderr || e.message}`;
  }
}
