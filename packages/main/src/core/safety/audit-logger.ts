// EKD Clean - Audit Logger
// Built by EKD Digital
//
// Provides comprehensive audit trail for all cleaning operations
// to ensure transparency and accountability.

import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";

export type AuditEventType =
  | "scan_started"
  | "scan_completed"
  | "scan_cancelled"
  | "clean_started"
  | "clean_completed"
  | "clean_failed"
  | "file_deleted"
  | "file_quarantined"
  | "file_restored"
  | "settings_changed"
  | "error";

export type AuditEvent = {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  scannerId?: string;
  scannerName?: string;
  userId?: string;
  details: Record<string, any>;
  filesAffected?: string[];
  spaceFreed?: number;
  success: boolean;
  errorMessage?: string;
};

export type AuditLogOptions = {
  logPath?: string;
  maxLogSize?: number; // bytes
  retentionDays?: number;
};

class AuditLoggerClass {
  private logPath: string;
  private maxLogSize: number;
  private retentionDays: number;
  private initialized = false;

  constructor() {
    this.logPath = join(homedir(), ".ekdclean", "audit.log");
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    this.retentionDays = 90; // Keep logs for 90 days
  }

  /**
   * Initialize the audit logger
   */
  async initialize(options?: AuditLogOptions): Promise<void> {
    if (options?.logPath) {
      this.logPath = options.logPath;
    }
    if (options?.maxLogSize) {
      this.maxLogSize = options.maxLogSize;
    }
    if (options?.retentionDays) {
      this.retentionDays = options.retentionDays;
    }

    // Ensure log directory exists
    const logDir = join(this.logPath, "..");
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create audit log directory:", error);
    }

    this.initialized = true;
  }

  /**
   * Log a scan started event
   */
  async logScanStarted(
    scannerId: string,
    scannerName: string,
    options?: Record<string, any>
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "scan_started",
      scannerId,
      scannerName,
      details: {
        options: options || {},
      },
      success: true,
    });
  }

  /**
   * Log a scan completed event
   */
  async logScanCompleted(
    scannerId: string,
    scannerName: string,
    itemsFound: number,
    totalSize: number
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "scan_completed",
      scannerId,
      scannerName,
      details: {
        itemsFound,
        totalSize,
      },
      success: true,
    });
  }

  /**
   * Log a scan cancelled event
   */
  async logScanCancelled(
    scannerId: string,
    scannerName: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "scan_cancelled",
      scannerId,
      scannerName,
      details: {
        reason: reason || "User cancelled",
      },
      success: true,
    });
  }

  /**
   * Log a clean started event
   */
  async logCleanStarted(
    scannerId: string,
    scannerName: string,
    itemCount: number,
    totalSize: number,
    quarantine: boolean
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "clean_started",
      scannerId,
      scannerName,
      details: {
        itemCount,
        totalSize,
        quarantine,
      },
      success: true,
    });
  }

  /**
   * Log a clean completed event
   */
  async logCleanCompleted(
    scannerId: string,
    scannerName: string,
    filesDeleted: number,
    spaceFreed: number,
    filesAffected: string[]
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "clean_completed",
      scannerId,
      scannerName,
      details: {
        filesDeleted,
      },
      filesAffected,
      spaceFreed,
      success: true,
    });
  }

  /**
   * Log a clean failed event
   */
  async logCleanFailed(
    scannerId: string,
    scannerName: string,
    error: string,
    filesAffected?: string[]
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "clean_failed",
      scannerId,
      scannerName,
      details: {},
      filesAffected,
      success: false,
      errorMessage: error,
    });
  }

  /**
   * Log a file deletion
   */
  async logFileDeleted(
    scannerId: string,
    filePath: string,
    size: number,
    quarantined: boolean
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: quarantined ? "file_quarantined" : "file_deleted",
      scannerId,
      details: {
        quarantined,
      },
      filesAffected: [filePath],
      spaceFreed: size,
      success: true,
    });
  }

  /**
   * Log a file restoration
   */
  async logFileRestored(
    quarantineId: string,
    originalPath: string,
    size: number
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "file_restored",
      details: {
        quarantineId,
      },
      filesAffected: [originalPath],
      spaceFreed: -size, // Negative because space was restored
      success: true,
    });
  }

  /**
   * Log settings changed
   */
  async logSettingsChanged(changes: Record<string, any>): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "settings_changed",
      details: {
        changes,
      },
      success: true,
    });
  }

  /**
   * Log an error
   */
  async logError(
    scannerId: string | undefined,
    error: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      id: this.generateId(),
      timestamp: new Date(),
      type: "error",
      scannerId,
      details: details || {},
      success: false,
      errorMessage: error,
    });
  }

  /**
   * Write an audit event to the log
   */
  private async log(event: AuditEvent): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Check if log rotation is needed
      await this.rotateLogIfNeeded();

      // Write event to log file
      const logLine = JSON.stringify(event) + "\n";
      await fs.appendFile(this.logPath, logLine, { encoding: "utf-8" });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  /**
   * Rotate log if it exceeds max size
   */
  private async rotateLogIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.logPath);
      if (stats.size >= this.maxLogSize) {
        // Move current log to archived log
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const archivePath = this.logPath.replace(".log", `.${timestamp}.log`);
        await fs.rename(this.logPath, archivePath);

        // Clean up old archived logs
        await this.cleanupOldLogs();
      }
    } catch (error) {
      // Log file doesn't exist yet, no rotation needed
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("Failed to rotate audit log:", error);
      }
    }
  }

  /**
   * Clean up archived logs older than retention period
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const logDir = join(this.logPath, "..");
      const files = await fs.readdir(logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      for (const file of files) {
        if (file.startsWith("audit.") && file.endsWith(".log")) {
          const filePath = join(logDir, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup old audit logs:", error);
    }
  }

  /**
   * Get audit events for a specific time range
   */
  async getEvents(
    startDate?: Date,
    endDate?: Date,
    type?: AuditEventType
  ): Promise<AuditEvent[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const events: AuditEvent[] = [];

    try {
      const logContent = await fs.readFile(this.logPath, { encoding: "utf-8" });
      const lines = logContent.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const event = JSON.parse(line) as AuditEvent;
          event.timestamp = new Date(event.timestamp); // Convert string to Date

          // Filter by date range
          if (startDate && event.timestamp < startDate) continue;
          if (endDate && event.timestamp > endDate) continue;

          // Filter by type
          if (type && event.type !== type) continue;

          events.push(event);
        } catch (parseError) {
          // Skip malformed lines
          console.warn("Failed to parse audit log line:", parseError);
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("Failed to read audit log:", error);
      }
    }

    return events;
  }

  /**
   * Generate a summary of cleaning activity
   */
  async getSummary(days: number = 30): Promise<{
    totalScans: number;
    totalCleans: number;
    totalFilesDeleted: number;
    totalSpaceFreed: number;
    errors: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.getEvents(startDate);

    let totalScans = 0;
    let totalCleans = 0;
    let totalFilesDeleted = 0;
    let totalSpaceFreed = 0;
    let errors = 0;

    for (const event of events) {
      if (event.type === "scan_completed") totalScans++;
      if (event.type === "clean_completed") {
        totalCleans++;
        totalFilesDeleted += event.details.filesDeleted || 0;
        totalSpaceFreed += event.spaceFreed || 0;
      }
      if (event.type === "error" || event.type === "clean_failed") errors++;
    }

    return {
      totalScans,
      totalCleans,
      totalFilesDeleted,
      totalSpaceFreed,
      errors,
    };
  }

  /**
   * Generate a unique ID for audit events
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export audit log to JSON file
   */
  async exportToFile(
    outputPath: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    const events = await this.getEvents(startDate, endDate);
    await fs.writeFile(outputPath, JSON.stringify(events, null, 2), {
      encoding: "utf-8",
    });
  }
}

// Singleton instance
export const AuditLogger = new AuditLoggerClass();
