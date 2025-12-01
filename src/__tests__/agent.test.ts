import { describe, it, expect, vi, beforeEach } from "vitest";
import { Agent } from "../agent.js";
import { GoogleGenAI } from "@google/genai";
import * as toolsModule from "../tools/index.js";

const mockChat = {
    sendMessageStream: vi.fn(),
    getHistory: vi.fn().mockResolvedValue([]),
};

const mockGenAIInstance = {
    chats: {
        create: vi.fn().mockReturnValue(mockChat)
    },
    models: {
        countTokens: vi.fn().mockResolvedValue({ totalTokens: 100 })
    }
};

vi.mock("@google/genai", () => {
    return {
        GoogleGenAI: class {
            chats = mockGenAIInstance.chats;
            models = mockGenAIInstance.models;
        },
        Chat: vi.fn(),
        Type: { OBJECT: "OBJECT", STRING: "STRING", NUMBER: "NUMBER", BOOLEAN: "BOOLEAN" }
    };
});

vi.mock("../tools/index.js");
vi.mock("../context.js", () => ({
    createContext: vi.fn().mockResolvedValue({
        files: [],
        date: "2023-01-01",
        reports: []
    })
}));

describe("Agent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockChat.sendMessageStream.mockReset();
        mockGenAIInstance.chats.create.mockClear();
        // Since GoogleGenAI is a class now, we can't inspect the constructor call easily on the class itself unless we spy on prototype or something, 
        // but checking side effects (calls to chats.create) is sufficient.
    });

    it("initializes and starts chat", async () => {
        const agent = new Agent({ apiKey: "key" });
        await agent.start();
        expect(mockGenAIInstance.chats.create).toHaveBeenCalled();
    });

    it("sends message and handles text response", async () => {
        const agent = new Agent({ apiKey: "key" });
        
        mockChat.sendMessageStream.mockResolvedValue((async function*() {
            yield { text: "Response" };
        })());

        const stream = await agent.sendMessage("Hello");
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);

        expect(chunks).toEqual(["Response"]);
    });

    it("handles tool calls", async () => {
        const agent = new Agent({ apiKey: "key" });

        mockChat.sendMessageStream
            .mockResolvedValueOnce((async function*() {
                yield { functionCalls: [{ name: "test_tool", args: { foo: "bar" } }] };
            })())
            .mockResolvedValueOnce((async function*() {
                yield { text: "Tool result processed" };
            })());

        const mockTool = {
            name: "test_tool",
            description: "desc",
            parameters: {},
            execute: vi.fn().mockResolvedValue("Tool Output")
        };
        (toolsModule.getToolByName as any).mockReturnValue(mockTool);

        const stream = await agent.sendMessage("Do task");
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);

        expect(chunks.join("")).toContain("Executing test_tool");
        expect(chunks.join("")).toContain("Result: Tool Output");
        expect(chunks.join("")).toContain("Tool result processed");
        
        expect(mockTool.execute).toHaveBeenCalledWith({ foo: "bar" }, expect.anything());
    });
    
    it("handles unknown tool calls", async () => {
        const agent = new Agent({ apiKey: "key" });

        mockChat.sendMessageStream
            .mockResolvedValueOnce((async function*() {
                yield { functionCalls: [{ name: "unknown_tool", args: {} }] };
            })())
            .mockResolvedValueOnce((async function*() {
                yield { text: "Error handled" };
            })());

        (toolsModule.getToolByName as any).mockReturnValue(undefined);

        const stream = await agent.sendMessage("Do unknown");
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);

        expect(chunks.join("")).toContain("Error: Unknown tool unknown_tool");
    });
});
