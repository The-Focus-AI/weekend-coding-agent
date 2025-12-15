import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultBashExecutor, executeTool } from "../src/tools/index";

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
    const result = await executeTool(
      "search_files",
      {
        query: "unique_string_to_find",
        path: TEST_DIR,
      },
      defaultBashExecutor,
    );

    expect(result).toContain("match.txt");
  });

  test("should exclude node_modules by default", async () => {
    const result = await executeTool(
      "search_files",
      {
        query: "unique_string_to_find",
        path: TEST_DIR,
      },
      defaultBashExecutor,
    );
    expect(result).toContain("match.txt");
    expect(result).not.toContain("ignored.txt");
  });

  test("should include node_modules when requested", async () => {
    const result = await executeTool(
      "search_files",
      {
        query: "unique_string_to_find",
        path: TEST_DIR,
        includeNodeModules: true,
      },
      defaultBashExecutor,
    );
    expect(result).toContain("match.txt");
    expect(result).toContain("ignored.txt");
  });
});
