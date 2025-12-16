import TurndownService from "turndown";

export async function downloadUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download URL: ${url} (Status: ${response.status} ${response.statusText})`,
    );
  }

  const html = await response.text();
  const turndownService = new TurndownService();
  return turndownService.turndown(html);
}
