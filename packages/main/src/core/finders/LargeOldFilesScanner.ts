// EKD Clean - Large & Old Files Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { BaseScanner } from "../scanner-core/BaseScanner";
import { ScanItem, ScanOptions, CleanResult, SupportedOS } from "../scanner-core/types";
import { PlatformPaths } from "../platform-adapters/paths";
import { FileOperations } from "../file-ops/operations";
import { Logger } from "../logger";

export type LargeOldFilesOptions = {
  minSizeMB?: number;
  minAgeDays?: number;
  searchPaths?: string[];
};

export class LargeOldFilesScanner extends BaseScanner {
  readonly id = "large-old-files";
  readonly name = "Large & Old Files";
  readonly description = "Find large and old files taking up space";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  private defaultSearchPaths = [
    join(homedir(), "Downloads"),
    join(homedir(), "Documents"),
  ];

  async scan(options: ScanOptions & { scanOptions?: LargeOldFilesOptions }): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting large & old files scan");
    
    const scanOpts = options.scanOptions || {};
    const minSizeBytes = (scanOpts.minSizeMB || 100) * 1024 * 1024; // Default 100MB
    const minAgeMs = (scanOpts.minAgeDays || 90) * 24 * 60 * 60 * 1000; // Default 90 days
    const searchPaths = scanOpts.searchPaths || this.defaultSearchPaths;

    const items: ScanItem[] = [];

    for (let i = 0; i < searchPaths.length; i++) {
      if (options.cancelToken?.cancelled) break;

      const searchPath = searchPaths[i];
      if (!existsSync(searchPath)) continue;

      try {
        const foundItems = await this.scanDirectory(
          searchPath,
          minSizeBytes,
          minAgeMs,
          options.cancelToken
        );
        items.push(...foundItems);

        if (options.onProgress) {
          options.onProgress((i + 1) / searchPaths.length);
        }
      } catch (error) {
        Logger.warn(this.id, `Failed to scan path: ${searchPath}`, {
          error: error instanceof Error ? error.message : "Unknown",
        });
      }
    }

    Logger.info(this.id, `Scan complete. Found ${items.length} large/old files`);
    return items;
  }

  private async scanDirectory(
    dirPath: string,
    minSizeBytes: number,
    minAgeMs: number,
    cancelToken?: any,
    depth = 0
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const maxDepth = 5; // Prevent infinite recursion

    if (depth > maxDepth || cancelToken?.cancelled) {
      return items;
    }

    // Skip protected paths
    if (PlatformPaths.isProtectedPath(dirPath)) {
      return items;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (cancelToken?.cancelled) break;

        const fullPath = join(dirPath, entry.name);

        // Skip hidden files and system directories
        if (entry.name.startsWith(".")) continue;

        try {
          const stats = await fs.stat(fullPath);
          const ageMs = Date.now() - stats.mtime.getTime();

          if (entry.isFile()) {
            // Check if file meets criteria
            if (stats.size >= minSizeBytes && ageMs >= minAgeMs) {
              const ageInDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
              const sizeMB = stats.size / (1024 * 1024);

              items.push({
                id: `large_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                path: fullPath,
                sizeBytes: stats.size,
                discoveredAt: new Date().toISOString(),
                category: "large-old-files",
                reason: `Large file (${sizeMB.toFixed(1)}MB) not accessed in ${ageInDays} days`,
                safeToDelete: false, // User should review large files
                confidence: 0.6, // Medium confidence
                metadata: {
                  fileName: entry.name,
                  sizeMB: Math.round(sizeMB * 10) / 10,
                  ageInDays,
                  lastAccessed: stats.atime.toISOString(),
                  lastModified: stats.mtime.toISOString(),
                },
              });
            }
          } else if (entry.isDirectory()) {
            // Recursively scan subdirectories
            const subItems = await this.scanDirectory(
              fullPath,
              minSizeBytes,
              minAgeMs,
              cancelToken,
              depth + 1
            );
            items.push(...subItems);
          }
        } catch (error) {
          // Skip files we can't access
          Logger.debug(this.id, `Skipping inaccessible file: ${fullPath}`);
        }
      }
    } catch (error) {
      Logger.warn(this.id, `Failed to read directory: ${dirPath}`, {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    return items;
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Cleaning ${items.length} large/old files`, {
      quarantine: options.quarantine,
    });

    const paths = items.map(item => item.path);
    const result = await FileOperations.safeDelete(paths, this.id, {
      quarantine: options.quarantine,
      dryRun: false,
    });

    Logger.info(this.id, "Clean complete", {
      filesDeleted: result.filesDeleted,
      spaceFreed: result.spaceFreed,
      errors: result.errors.length,
    });

    return {
      success: result.success,
      itemsCleaned: result.filesDeleted,
      spaceFreed: result.spaceFreed,
      errors: result.errors,
      quarantined: options.quarantine,
    };
  }

  async restore(quarantineId: string): Promise<boolean> {
    Logger.info(this.id, `Restoring quarantined item: ${quarantineId}`);
    const { QuarantineManager } = await import("../file-ops/quarantine");
    return await QuarantineManager.restoreFile(quarantineId);
  }
}
