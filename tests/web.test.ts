import { afterAll, describe, expect, mock, test } from "bun:test";
import { downloadUrl } from "../src/tools/web";

describe("Web Tool", () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("should download and convert url", async () => {
    // @ts-expect-error
    global.fetch = mock(
      async () => new Response("<h1>Hello World</h1><p>Check this out.</p>"),
    );

    const markdown = await downloadUrl("https://example.com");
    expect(markdown).toContain("Hello World"); // turndown might output Hello World\n=========== or # Hello World depending on config
    expect(markdown).toContain("Check this out.");
  });
});
