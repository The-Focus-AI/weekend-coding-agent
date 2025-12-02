import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CommandManager } from "../commands.js";
import { Agent } from "../agent.js";
import * as fs from "node:fs";

vi.mock("node:fs");
vi.mock("../agent.js"); // Mock Agent class

describe("CommandManager", () => {
    let agent: Agent;
    let manager: CommandManager;
    let mockContext: any;

    beforeEach(() => {
        agent = new Agent({ apiKey: "key" });
        agent.sendMessage = vi.fn().mockResolvedValue((async function*(){})());
        agent.reset = vi.fn();

        manager = new CommandManager(".commands");
        vi.clearAllMocks();
        
        // Mock fs default behaviors
        (fs.existsSync as any).mockReturnValue(false);

        mockContext = {
            log: vi.fn(),
            sendMessage: vi.fn().mockResolvedValue(undefined)
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("handles built-in commands", async () => {
        await manager.loadCommands();
        
        // Test /clear
        await manager.handleCommand("/clear", agent, mockContext);
        expect(agent.reset).toHaveBeenCalled();
        expect(mockContext.log).toHaveBeenCalledWith("Chat history cleared.");

        // Test /help
        await manager.handleCommand("/help", agent, mockContext);
        expect(mockContext.log).toHaveBeenCalledWith(expect.stringContaining("Available commands"));
    });

    it("loads custom commands from files", async () => {
        (fs.existsSync as any).mockReturnValue(true);
        (fs.readdirSync as any).mockReturnValue(["custom.md"]);
        (fs.readFileSync as any).mockReturnValue("Custom prompt");

        await manager.loadCommands();
        
        await manager.handleCommand("/custom", agent, mockContext);
        
        // In the new implementation, it calls context.sendMessage instead of agent.sendMessage
        expect(mockContext.sendMessage).toHaveBeenCalledWith(expect.stringContaining("Custom prompt"));
    });

    it("handles argument replacement in custom commands", async () => {
        (fs.existsSync as any).mockReturnValue(true);
        (fs.readdirSync as any).mockReturnValue(["arg_cmd.md"]);
        (fs.readFileSync as any).mockReturnValue("Prompt with $ARGUMENTS");

        await manager.loadCommands();
        
        await manager.handleCommand("/arg_cmd hello world", agent, mockContext);
        
        expect(mockContext.sendMessage).toHaveBeenCalledWith("Prompt with hello world");
    });
});
