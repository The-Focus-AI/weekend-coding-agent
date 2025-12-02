import React from 'react';
import { render } from 'ink';
import { App } from './App.js';
import { Agent } from '../agent.js';
import { CommandManager } from '../commands.js';

export async function startTui(agent: Agent, commandManager: CommandManager) {
    const { waitUntilExit } = render(<App agent={agent} commandManager={commandManager} />);
    await waitUntilExit();
}
