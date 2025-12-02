import React from 'react';
import { Box, Text } from 'ink';

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

interface ChatPaneProps {
    isActive: boolean;
    messages?: ChatMessage[];
}

export const ChatPane: React.FC<ChatPaneProps> = ({ isActive, messages = [] }) => {
    return (
        <Box 
            flexGrow={1} 
            flexBasis="66%" 
            borderStyle={isActive ? 'double' : 'single'} 
            borderColor={isActive ? 'blue' : 'white'}
            flexDirection="column"
            padding={1}
        >
            <Text bold>Chat History</Text>
            <Box flexDirection="column" flexGrow={1}>
                {messages.length === 0 ? (
                    <Text dimColor>No messages yet.</Text>
                ) : (
                    messages.map((msg: ChatMessage, i: number) => (
                        <Box key={i} flexDirection="column" marginBottom={1}>
                            <Text color={msg.role === 'user' ? 'green' : 'magenta'} bold>
                                {msg.role.toUpperCase()}:
                            </Text>
                            {/* 
                                Note: Replaced ink-markdown with plain Text due to ESM/CJS compatibility issues 
                                with ink-markdown v1.0.4 and Ink v6. 
                                TODO: Implement custom markdown renderer or find compatible library.
                            */}
                            <Text>{msg.content}</Text>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};
