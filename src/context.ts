import * as fs from 'fs/promises';
import * as path from 'path';

export interface Context {
  date: string;
  files: string[];
  reports: { filename: string; frontmatter: string }[];
}

export async function createContext(filePaths: string[] = []): Promise<Context> {
  const reportsDir = 'reports';
  const reports: { filename: string; frontmatter: string }[] = [];

  try {
    const reportFiles = await fs.readdir(reportsDir);
    for (const file of reportFiles) {
      if (file.endsWith('.md')) {
        const filePath = path.join(reportsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (match) {
          reports.push({
            filename: `${reportsDir}/${file}`,
            frontmatter: match[1],
          });
        }
      }
    }
  } catch (error) {
    // If reports directory doesn't exist or other error, just ignore for now
    // We can silently fail or log a warning, but for now let's just proceed with empty reports
  }

  return {
    date: new Date().toISOString(),
    files: filePaths,
    reports,
  };
}
