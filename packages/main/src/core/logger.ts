// EKD Clean - Structured Logger
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, any>;
};

export class Logger {
  private static logDir = join(homedir(), ".ekdclean", "logs");
  private static logFile = join(this.logDir, "ekdclean.log");
  private static maxLogSize = 10 * 1024 * 1024; // 10MB
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.logDir, { recursive: true });
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize logger:", error);
    }
  }

  static async log(
    level: LogLevel,
    category: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.initialize();

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
    };

    // Console output
    const consoleMessage = `[${entry.timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;
    const args = metadata ? [consoleMessage, metadata] : [consoleMessage];

    switch (level) {
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.info(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
    }

    // File output
    try {
      await this.rotateLogIfNeeded();
      const logLine = JSON.stringify(entry) + "\n";
      await fs.appendFile(this.logFile, logLine, "utf-8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  static debug(
    category: string,
    message: string,
    metadata?: Record<string, any>
  ): void {
    this.log("debug", category, message, metadata);
  }

  static info(
    category: string,
    message: string,
    metadata?: Record<string, any>
  ): void {
    this.log("info", category, message, metadata);
  }

  static warn(
    category: string,
    message: string,
    metadata?: Record<string, any>
  ): void {
    this.log("warn", category, message, metadata);
  }

  static error(
    category: string,
    message: string,
    metadata?: Record<string, any>
  ): void {
    this.log("error", category, message, metadata);
  }

  private static async rotateLogIfNeeded(): Promise<void> {
    try {
      if (existsSync(this.logFile)) {
        const stats = await fs.stat(this.logFile);
        if (stats.size >= this.maxLogSize) {
          const rotatedFile = join(this.logDir, `ekdclean-${Date.now()}.log`);
          await fs.rename(this.logFile, rotatedFile);
        }
      }
    } catch (error) {
      console.error("Failed to rotate log file:", error);
    }
  }

  static async getRecentLogs(limit = 100): Promise<LogEntry[]> {
    await this.initialize();

    try {
      if (!existsSync(this.logFile)) {
        return [];
      }

      const content = await fs.readFile(this.logFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      const entries: LogEntry[] = lines
        .slice(-limit)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((entry): entry is LogEntry => entry !== null);

      return entries;
    } catch (error) {
      console.error("Failed to read log file:", error);
      return [];
    }
  }
}
