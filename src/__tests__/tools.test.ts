import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { readFileTool } from "../tools/read-file.js";
import { listFilesTool } from "../tools/list-files.js";
import { editFileTool } from "../tools/edit-file.js";

const TEST_DIR = ".test-sandbox";

describe("tools", () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("read_file", () => {
    it("reads existing file", async () => {
      await fs.writeFile(path.join(TEST_DIR, "test.txt"), "hello world");
      const result = await readFileTool.execute({ path: `${TEST_DIR}/test.txt` });
      expect(result).toBe("hello world");
    });

    it("returns error for missing file", async () => {
      const result = await readFileTool.execute({ path: `${TEST_DIR}/missing.txt` });
      expect(result).toContain("Error: File not found");
    });
  });

  describe("list_files", () => {
    it("lists directory contents", async () => {
      await fs.writeFile(path.join(TEST_DIR, "a.txt"), "");
      await fs.writeFile(path.join(TEST_DIR, "b.txt"), "");
      await fs.mkdir(path.join(TEST_DIR, "subdir"));

      const result = await listFilesTool.execute({ path: TEST_DIR });
      expect(result).toContain("a.txt");
      expect(result).toContain("b.txt");
      expect(result).toContain("subdir/");
    });
  });

  describe("edit_file", () => {
    it("replaces text in existing file", async () => {
      await fs.writeFile(path.join(TEST_DIR, "edit.txt"), "hello world");

      const result = await editFileTool.execute({
        path: `${TEST_DIR}/edit.txt`,
        old_str: "world",
        new_str: "universe",
      });

      expect(result).toBe("OK");
      const content = await fs.readFile(path.join(TEST_DIR, "edit.txt"), "utf-8");
      expect(content).toBe("hello universe");
    });

    it("creates new file when old_str is empty", async () => {
      const result = await editFileTool.execute({
        path: `${TEST_DIR}/new.txt`,
        old_str: "",
        new_str: "new content",
      });

      expect(result).toBe("OK (created new file)");
      const content = await fs.readFile(path.join(TEST_DIR, "new.txt"), "utf-8");
      expect(content).toBe("new content");
    });
  });
});
