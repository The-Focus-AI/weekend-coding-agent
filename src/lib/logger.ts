import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import type { Message } from "./types";

export interface Logger {
  log(message: Message): void;
  child(agentName: string): Logger;
}

export class SessionLogger implements Logger {
  private logFile: string;
  private sessionId: string;
  private parentId: string | null;
  private agentName: string;

  constructor(
    logFile: string,
    sessionId: string = randomUUID(),
    parentId: string | null = null,
    agentName: string = "main",
  ) {
    this.logFile = logFile;
    this.sessionId = sessionId;
    this.parentId = parentId;
    this.agentName = agentName;
  }

  log(message: Message): void {
    const entry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      parentId: this.parentId,
      agentName: this.agentName,
      message,
    };
    try {
      fs.appendFileSync(this.logFile, `${JSON.stringify(entry)}\n`);
    } catch (err) {
      console.error("Failed to write to session log:", err);
    }
  }

  child(agentName: string): Logger {
    const childSessionId = randomUUID();
    return new SessionLogger(
      this.logFile,
      childSessionId,
      this.sessionId,
      agentName,
    );
  }
}
