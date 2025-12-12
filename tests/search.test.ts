import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { executeTool } from "../src/lib/tools";

const TEST_DIR = "temp_search_test";
const NODE_MODULES = "node_modules";

describe("search_files Tool", () => {
  beforeAll(async () => {
    // Setup test directory structure
    await mkdir(join(TEST_DIR, NODE_MODULES, "some_pkg"), { recursive: true });

    // Create a file in root of test dir
    await writeFile(join(TEST_DIR, "match.txt"), "unique_string_to_find");

    // Create a file in node_modules
    await writeFile(
      join(TEST_DIR, NODE_MODULES, "some_pkg", "ignored.txt"),
      "unique_string_to_find",
    );
  });

  afterAll(async () => {
    // Cleanup
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  test("should find string in normal files", async () => {
    const result = await executeTool("search_files", {
      query: "unique_string_to_find",
      path: TEST_DIR,
    });

    expect(result).toContain("match.txt");
    // By default legacy/current behavior: might include node_modules if not excluded?
    // Actually standard grep -r DOES include node_modules unless excluded.
    // So BEFORE the fix, this might actually contain ignored.txt
    // But we are writing the test to Verify the NEW behavior.
    // So I expect this to FAIL initially if I assert it DOES NOT contain ignored.txt
    // or PASS if I haven't implemented the fix yet and I assert it DOES contain it.

    // Let's first see what happens currently.
    // The prompt says "update the search tool ... so that it doesn't ... by default".
    // So currently it DOES.
  });

  test("should exclude node_modules by default", async () => {
    const result = await executeTool("search_files", {
      query: "unique_string_to_find",
      path: TEST_DIR,
    });
    expect(result).toContain("match.txt");
    expect(result).not.toContain("ignored.txt");
  });

  test("should include node_modules when requested", async () => {
    const result = await executeTool("search_files", {
      query: "unique_string_to_find",
      path: TEST_DIR,
      includeNodeModules: true,
    });
    expect(result).toContain("match.txt");
    expect(result).toContain("ignored.txt");
  });
});
