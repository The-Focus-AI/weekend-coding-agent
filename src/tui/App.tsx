import React, { useState } from 'react';
import { Box, useInput, useApp } from 'ink';
import { ChatPane } from './ChatPane.js';
import { NavigationPane } from './NavigationPane.js';
import { InputPane } from './InputPane.js';
import { useAgent } from './hooks/useAgent.js';
import { Agent } from '../agent.js';
import { CommandManager } from '../commands.js';

type Pane = 'chat' | 'navigation' | 'input';

interface AppProps {
    agent: Agent;
    commandManager: CommandManager;
}

export const App: React.FC<AppProps> = ({ agent, commandManager }) => {
  const { exit } = useApp();
  const [activePane, setActivePane] = useState<Pane>('input');
  const { messages, sendMessage, isThinking } = useAgent(agent, commandManager);

  useInput((input, key) => {
    if (key.tab) {
        setActivePane((current) => {
            if (key.shift) {
                // Cycle backward
                if (current === 'input') return 'navigation';
                if (current === 'navigation') return 'chat';
                return 'input';
            } else {
                // Cycle forward
                if (current === 'chat') return 'navigation';
                if (current === 'navigation') return 'input';
                return 'chat';
            }
        });
    }

    // Ctrl+C is handled by Ink by default
  });

  return (
    <Box flexDirection="column" height="100%">
      {/* Top Section */}
      <Box flexDirection="row" flexGrow={1}>
        <ChatPane isActive={activePane === 'chat'} messages={messages} />
        <NavigationPane isActive={activePane === 'navigation'} />
      </Box>

      {/* Bottom Section */}
      <InputPane 
        isActive={activePane === 'input'}
        onSubmit={(text) => {
            if (text.trim()) {
                sendMessage(text);
            }
        }}
      />
    </Box>
  );
};
