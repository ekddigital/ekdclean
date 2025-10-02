// EKD Clean - Quarantine Management System
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join, basename } from "path";
import { homedir } from "os";
import crypto from "crypto";
import { QuarantineEntry } from "../scanner-core/types";

export class QuarantineManager {
  private static quarantineDir = join(homedir(), ".ekdclean", "quarantine");
  private static indexPath = join(homedir(), ".ekdclean", "quarantine-index.json");
  private static index: Map<string, QuarantineEntry> = new Map();
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create quarantine directory
      await fs.mkdir(this.quarantineDir, { recursive: true });

      // Load index
      if (existsSync(this.indexPath)) {
        const data = await fs.readFile(this.indexPath, "utf-8");
        const entries: QuarantineEntry[] = JSON.parse(data);
        entries.forEach(entry => this.index.set(entry.id, entry));
      }

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize quarantine:", error);
      throw error;
    }
  }

  static async quarantineFile(
    filePath: string,
    category: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    await this.initialize();

    try {
      // Check if file exists
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Calculate checksum
      const checksum = await this.calculateChecksum(filePath);

      // Generate unique ID
      const id = `quar_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

      // Create quarantine path
      const fileName = basename(filePath);
      const quarantinePath = join(this.quarantineDir, `${id}_${fileName}`);

      // Move file to quarantine (preserve original)
      await fs.copyFile(filePath, quarantinePath);

      // Create quarantine entry
      const entry: QuarantineEntry = {
        id,
        originalPath: filePath,
        quarantinePath,
        size: stats.size,
        checksum,
        timestamp: new Date().toISOString(),
        category,
        metadata,
      };

      // Add to index
      this.index.set(id, entry);
      await this.saveIndex();

      // Delete original file
      await fs.unlink(filePath);

      return id;
    } catch (error) {
      console.error(`Failed to quarantine file ${filePath}:`, error);
      throw error;
    }
  }

  static async restoreFile(quarantineId: string): Promise<boolean> {
    await this.initialize();

    try {
      const entry = this.index.get(quarantineId);
      if (!entry) {
        throw new Error(`Quarantine entry not found: ${quarantineId}`);
      }

      // Check if quarantined file exists
      if (!existsSync(entry.quarantinePath)) {
        throw new Error(`Quarantined file not found: ${entry.quarantinePath}`);
      }

      // Verify checksum
      const currentChecksum = await this.calculateChecksum(entry.quarantinePath);
      if (currentChecksum !== entry.checksum) {
        throw new Error("Checksum mismatch - quarantined file may be corrupted");
      }

      // Restore file to original location
      await fs.copyFile(entry.quarantinePath, entry.originalPath);

      // Delete quarantined file
      await fs.unlink(entry.quarantinePath);

      // Remove from index
      this.index.delete(quarantineId);
      await this.saveIndex();

      return true;
    } catch (error) {
      console.error(`Failed to restore file ${quarantineId}:`, error);
      return false;
    }
  }

  static async getEntry(quarantineId: string): Promise<QuarantineEntry | undefined> {
    await this.initialize();
    return this.index.get(quarantineId);
  }

  static async listEntries(): Promise<QuarantineEntry[]> {
    await this.initialize();
    return Array.from(this.index.values());
  }

  static async clearQuarantine(olderThanDays?: number): Promise<number> {
    await this.initialize();

    let clearedCount = 0;
    const now = Date.now();
    const cutoffTime = olderThanDays ? now - olderThanDays * 24 * 60 * 60 * 1000 : 0;

    for (const [id, entry] of this.index.entries()) {
      const entryTime = new Date(entry.timestamp).getTime();
      
      if (olderThanDays && entryTime > cutoffTime) {
        continue;
      }

      try {
        if (existsSync(entry.quarantinePath)) {
          await fs.unlink(entry.quarantinePath);
        }
        this.index.delete(id);
        clearedCount++;
      } catch (error) {
        console.error(`Failed to clear quarantine entry ${id}:`, error);
      }
    }

    await this.saveIndex();
    return clearedCount;
  }

  private static async calculateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash("sha256");
    const stream = await fs.readFile(filePath);
    hash.update(stream);
    return hash.digest("hex");
  }

  private static async saveIndex(): Promise<void> {
    try {
      const entries = Array.from(this.index.values());
      await fs.writeFile(this.indexPath, JSON.stringify(entries, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save quarantine index:", error);
      throw error;
    }
  }
}
