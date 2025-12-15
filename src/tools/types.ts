export type CommandExecutor = (command: string) => Promise<string>;

export type AgentRunner = (agentName: string, task: string) => Promise<string>;
