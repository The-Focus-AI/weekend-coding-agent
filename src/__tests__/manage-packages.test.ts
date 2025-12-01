import { describe, it, expect, vi, afterEach } from "vitest";
import { managePackagesTool } from "../tools/manage-packages.js";
import { ToolContext } from "../tools/types.js";
import * as child_process from "node:child_process";

vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

describe("manage_packages tool", () => {
    const mockContext = {} as ToolContext;

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("installs packages", async () => {
        const mockExec = child_process.exec as unknown as ReturnType<typeof vi.fn>;
        mockExec.mockImplementation((cmd, cb) => cb(null, { stdout: "installed", stderr: "" }));

        const result = await managePackagesTool.execute({ action: "add", packages: "pkg1 pkg2" }, mockContext);
        expect(result).toContain("STDOUT:\ninstalled");
        expect(mockExec).toHaveBeenCalledWith(expect.stringContaining("pnpm add pkg1 pkg2"), expect.any(Function));
    });

    it("installs dev packages", async () => {
        const mockExec = child_process.exec as unknown as ReturnType<typeof vi.fn>;
        mockExec.mockImplementation((cmd, cb) => cb(null, { stdout: "installed", stderr: "" }));

        await managePackagesTool.execute({ action: "add", packages: "pkg1", dev: true }, mockContext);
        expect(mockExec).toHaveBeenCalledWith(expect.stringContaining("pnpm add pkg1 -D"), expect.any(Function));
    });

    it("removes packages", async () => {
         const mockExec = child_process.exec as unknown as ReturnType<typeof vi.fn>;
         mockExec.mockImplementation((cmd, cb) => cb(null, { stdout: "removed", stderr: "" }));
         
         await managePackagesTool.execute({ action: "remove", packages: "pkg1" }, mockContext);
         expect(mockExec).toHaveBeenCalledWith(expect.stringContaining("pnpm remove pkg1"), expect.any(Function));
    });

    it("validates action", async () => {
        const result = await managePackagesTool.execute({ action: "invalid", packages: "pkg1" }, mockContext);
        expect(result).toContain("Error: Invalid action");
    });
});
