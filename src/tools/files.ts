import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function listFiles(dirPath: string = "."): Promise<string> {
  try {
    const files = await readdir(dirPath);
    // Add logic to clarify file vs directory if needed, for now just list
    // A simple ls -F style suffixing could be useful
    const detailedList = await Promise.all(
      files.map(async (f) => {
        const fullPath = join(dirPath, f);
        try {
          const s = await stat(fullPath);
          return s.isDirectory() ? `${f}/` : f;
        } catch {
          return f;
        }
      }),
    );
    return detailedList.join("\n");
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
}

export async function readFileContent(
  filePath: string,
  startLine: number = 1,
  limit: number = 500,
): Promise<string> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    const start = Math.max(0, startLine - 1);
    const safeLimit = Math.min(limit, 500); // Enforce 500 line limit
    const end = Math.min(lines.length, start + safeLimit);

    const selectedLines = lines.slice(start, end);
    let result = selectedLines.join("\n");

    // If not showing the entire file, append a message
    if (lines.length > end - start) {
      result += `\n\n(Showing lines ${start + 1}-${end} of ${lines.length}. Use startLine and limit to see more.)`;
    }

    return result;
  } catch (e: any) {
    return `Error reading file: ${e.message}`;
  }
}

export async function writeFileContent(
  filePath: string,
  content: string,
): Promise<string> {
  try {
    await writeFile(filePath, content, "utf-8");
    return `Successfully wrote to ${filePath}`;
  } catch (e: any) {
    return `Error writing file: ${e.message}`;
  }
}

export async function replaceInFile(
  filePath: string,
  oldText: string,
  newText: string,
): Promise<string> {
  try {
    const content = await readFile(filePath, "utf-8");
    if (!content.includes(oldText)) {
      return `Error: 'oldText' not found in ${filePath}`;
    }
    // Check uniqueness
    if (content.split(oldText).length - 1 > 1) {
      return `Error: 'oldText' is not unique in ${filePath}. Please provide more context.`;
    }
    const newContent = content.replace(oldText, newText);
    await writeFile(filePath, newContent, "utf-8");
    return `Successfully replaced text in ${filePath}`;
  } catch (e: any) {
    return `Error replacing text: ${e.message}`;
  }
}
