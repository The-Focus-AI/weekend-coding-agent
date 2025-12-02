import { useState, useEffect, useCallback } from 'react';
import { Agent } from '../../agent.js';
import { ChatMessage } from '../ChatPane.js';
import { CommandManager } from '../../commands.js';

export function useAgent(agent: Agent, commandManager: CommandManager) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);

    // Initial load of history
    useEffect(() => {
        const loadHistory = async () => {
            const history = await agent.getHistory();
            if (history && history.length > 0) {
                 const formatted: ChatMessage[] = history.map((h: any) => ({
                     role: h.role,
                     content: h.parts ? h.parts.map((p: any) => p.text || '').join('') : ''
                 }));
                 setMessages(formatted);
            }
        };
        loadHistory();
    }, [agent]);

    const sendMessage = useCallback(async (text: string) => {
        // Check for command
        if (text.startsWith('/')) {
            const handled = await commandManager.handleCommand(text, agent, {
                log: (msg: string) => {
                    setMessages((prev: ChatMessage[]) => [...prev, { role: 'system', content: msg }]);
                },
                sendMessage: async (msg: string) => {
                    // Recursive call to send message from command
                    // We need to be careful not to trigger infinite loop if command calls itself, but usually fine
                    // We can't call sendMessage recursively easily because of the closure?
                    // actually we can.
                    // But wait, command execution logic in custom commands calls sendMessage.
                    // We need to extract the "send to agent" logic.
                    // For now, let's just use the main logic
                    await sendToAgent(msg);
                }
            });
            if (handled) return;
        }

        await sendToAgent(text);

    }, [agent, commandManager]);

    const sendToAgent = async (text: string) => {
        // Optimistic update
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'user', content: text }]);
        setIsThinking(true);

        // Add placeholder for model response
        setMessages((prev: ChatMessage[]) => [...prev, { role: 'model', content: '' }]);

        let responseText = '';

        try {
            const generator = await agent.sendMessage(text);
            for await (const chunk of generator) {
                responseText += chunk;
                
                // Update the last message (model response)
                setMessages((prev: ChatMessage[]) => {
                    const newHistory = [...prev];
                    const lastMsg = newHistory[newHistory.length - 1];
                    if (lastMsg && lastMsg.role === 'model') {
                        // We replace content because we accumulate it locally
                        lastMsg.content = responseText;
                    }
                    return newHistory;
                });
            }
        } catch (e) {
            setMessages((prev: ChatMessage[]) => [...prev, { role: 'system', content: `Error: ${e}` }]);
        } finally {
            setIsThinking(false);
        }
    };

    return { messages, sendMessage, isThinking };
}
