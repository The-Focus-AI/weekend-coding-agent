import * as fs from 'fs/promises';
import * as path from 'path';
import { GoogleGenAI } from "@google/genai";

export class SessionLogger {
  private logDir = ".sessions_log";
  private logFile: string | null = null;
  private loggedCount = 0;
  private ai: GoogleGenAI;
  private lastFirstMessage: string | null = null;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  private getTimestamp(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}-${hh}-${min}`;
  }

  private async generateTopic(messages: any[]): Promise<string> {
    if (messages.length === 0) return "unknown-topic";
    
    // We try to use the text from the first user message
    // Inspecting the message structure would be ideal, but for now we fallback to JSON
    const context = JSON.stringify(messages.slice(0, 2));

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
            {
                role: "user",
                parts: [{ text: `Generate a short, hyphenated-topic-string (max 5 words) for this conversation session. Do not include date. Return ONLY the topic string. Conversation start: ${context}` }]
            }
        ]
      });
      
      let topic = response.text?.trim() || "unknown-topic";
      // Clean up the topic to be filename safe
      topic = topic.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      // Remove leading/trailing hyphens
      topic = topic.replace(/^-+|-+$/g, '');
      
      if (!topic) topic = "unknown-topic";
      return topic;
    } catch (error) {
        // Log the error to a file so it's not lost but doesn't crash the CLI
        const errorLogPath = path.join(this.logDir, "error.log");
        const errorMessage = `[${this.getTimestamp()}] Error generating topic: ${error}\n`;
        
        // Use fs.appendFile but strictly we should probably ensure directory exists first
        // However, log() ensures it. generateTopic is called from log().
        
        fs.appendFile(errorLogPath, errorMessage).catch(e => console.error("Failed to write to error log:", e));
        
        return "unknown-topic";
    }
  }

  async log(messages: any[]) {
    if (messages.length === 0) return;

    // Check if the conversation has changed completely (e.g. resume session)
    const currentFirstMessage = JSON.stringify(messages[0]);
    if (this.lastFirstMessage && this.lastFirstMessage !== currentFirstMessage) {
        // Conversation changed root! Start a new file.
        this.reset();
    }
    this.lastFirstMessage = currentFirstMessage;

    // Check if we have new messages to log, or if history shrunk
    if (messages.length < this.loggedCount) {
         this.reset();
         this.lastFirstMessage = currentFirstMessage;
    } else if (messages.length <= this.loggedCount) {
        return;
    }

    if (!this.logFile) {
        // Ensure directory exists
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (e) {
            // ignore if exists
        }

        const topic = await this.generateTopic(messages);
        const timestamp = this.getTimestamp();
        const filename = `${timestamp}-${topic}.jsonl`;
        
        this.logFile = path.join(this.logDir, filename);
    }

    const newMessages = messages.slice(this.loggedCount);
    // Filter out empty messages if any?
    
    const content = newMessages.map(m => JSON.stringify(m)).join('\n') + '\n';
    
    if (this.logFile) {
        await fs.appendFile(this.logFile, content);
        this.loggedCount = messages.length;
    }
  }

  reset() {
      this.logFile = null;
      this.loggedCount = 0;
      this.lastFirstMessage = null;
  }
}
