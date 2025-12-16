interface TavilyResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  score: number;
}

interface TavilyResponse {
  answer?: string;
  query: string;
  results: TavilyResult[];
  images?: string[];
}

export async function tavilySearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set in environment variables");
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to search Tavily: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as TavilyResponse;
    return formatTavilyResponse(data);
  } catch (error: any) {
    return `Error performing Tavily search: ${error.message}`;
  }
}

function formatTavilyResponse(data: TavilyResponse): string {
  let output = `### Search Results for "${data.query}"\n\n`;

  if (data.answer) {
    output += `**Answer:**\n${data.answer}\n\n`;
  }

  if (data.results && data.results.length > 0) {
    output += `**Sources:**\n`;
    data.results.forEach((result, index) => {
      output += `${index + 1}. [${result.title}](${result.url})\n`;
      if (result.content) {
        output += `   > ${result.content.replace(/\n/g, "\n   > ")}\n`;
      }
      output += "\n";
    });
  } else {
    output += "No results found.\n";
  }

  return output;
}
