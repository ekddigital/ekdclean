// EKD Clean - System Junk Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir, tmpdir } from "os";
import { BaseScanner } from "../scanner-core/BaseScanner";
import { ScanItem, ScanOptions, CleanResult, SupportedOS } from "../scanner-core/types";
import { PlatformPaths } from "../platform-adapters/paths";
import { FileOperations } from "../file-ops/operations";
import { Logger } from "../logger";

export class SystemJunkScanner extends BaseScanner {
  readonly id = "system-junk";
  readonly name = "System Junk";
  readonly description = "Clean system caches, temp files, and application junk";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting system junk scan");
    const items: ScanItem[] = [];

    // Scan application caches
    const cacheItems = await this.scanApplicationCaches(options);
    items.push(...cacheItems);

    // Scan system temp files
    const tempItems = await this.scanTempFiles(options);
    items.push(...tempItems);

    // Scan development artifacts
    const devItems = await this.scanDevelopmentArtifacts(options);
    items.push(...devItems);

    Logger.info(this.id, `System junk scan complete. Found ${items.length} items`);
    return items;
  }

  private async scanApplicationCaches(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const cachePaths = PlatformPaths.getCachePaths();

    for (const cachePath of cachePaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(cachePath)) continue;

        const cacheItems = await this.scanCacheDirectory(cachePath, options, 0);
        items.push(...cacheItems);
      } catch (error) {
        Logger.debug(this.id, `Failed to scan cache path: ${cachePath}`);
      }
    }

    return items;
  }

  private async scanCacheDirectory(
    dirPath: string,
    options: ScanOptions,
    depth: number
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const maxDepth = 2;

    if (depth > maxDepth || options.cancelToken?.cancelled) {
      return items;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (options.cancelToken?.cancelled) break;

        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isDirectory()) {
            // Check if this is a sizable cache directory
            const size = await FileOperations.getDirectorySize(fullPath);
            
            // Report directories over 10MB
            if (size > 10 * 1024 * 1024) {
              items.push({
                id: `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                path: fullPath,
                sizeBytes: size,
                discoveredAt: new Date().toISOString(),
                category: "app-cache",
                reason: `Application cache (${(size / 1024 / 1024).toFixed(1)}MB)`,
                safeToDelete: true,
                confidence: 0.9,
                metadata: {
                  dirName: entry.name,
                  sizeMB: Math.round(size / 1024 / 1024 * 10) / 10,
                },
              });
            }
          }
        } catch (error) {
          Logger.debug(this.id, `Failed to process: ${fullPath}`);
        }
      }
    } catch (error) {
      Logger.debug(this.id, `Failed to read directory: ${dirPath}`);
    }

    return items;
  }

  private async scanTempFiles(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const tempPath = tmpdir();
    const minAge = 24 * 60 * 60 * 1000; // 24 hours

    try {
      if (!existsSync(tempPath)) return items;

      const entries = await fs.readdir(tempPath, { withFileTypes: true });

      for (const entry of entries) {
        if (options.cancelToken?.cancelled) break;

        const fullPath = join(tempPath, entry.name);

        try {
          const stats = await fs.stat(fullPath);
          const age = Date.now() - stats.mtime.getTime();

          // Only include old temp files
          if (age >= minAge) {
            const ageInDays = age / (1000 * 60 * 60 * 24);

            if (entry.isFile()) {
              items.push({
                id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                path: fullPath,
                sizeBytes: stats.size,
                discoveredAt: new Date().toISOString(),
                category: "temp-file",
                reason: `Temporary file (${ageInDays.toFixed(0)} days old)`,
                safeToDelete: true,
                confidence: 0.95,
                metadata: {
                  fileName: entry.name,
                  ageInDays: Math.floor(ageInDays),
                },
              });
            } else if (entry.isDirectory()) {
              const size = await FileOperations.getDirectorySize(fullPath);
              if (size > 0) {
                items.push({
                  id: `temp_dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  path: fullPath,
                  sizeBytes: size,
                  discoveredAt: new Date().toISOString(),
                  category: "temp-directory",
                  reason: `Temporary directory (${ageInDays.toFixed(0)} days old, ${(size / 1024 / 1024).toFixed(1)}MB)`,
                  safeToDelete: true,
                  confidence: 0.9,
                  metadata: {
                    dirName: entry.name,
                    ageInDays: Math.floor(ageInDays),
                    sizeMB: Math.round(size / 1024 / 1024 * 10) / 10,
                  },
                });
              }
            }
          }
        } catch (error) {
          Logger.debug(this.id, `Failed to process temp file: ${fullPath}`);
        }
      }
    } catch (error) {
      Logger.warn(this.id, `Failed to scan temp directory: ${tempPath}`);
    }

    return items;
  }

  private async scanDevelopmentArtifacts(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const devPaths = [
      join(home, ".npm/_cacache"),
      join(home, ".yarn/cache"),
      join(home, ".cache/pip"),
      join(home, "Library/Caches/Homebrew"),
      join(home, "Library/Caches/com.apple.dt.Xcode"),
      join(home, ".gradle/caches"),
      join(home, ".m2/repository"),
    ];

    for (const devPath of devPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(devPath)) continue;

        const size = await FileOperations.getDirectorySize(devPath);
        
        // Report caches over 50MB
        if (size > 50 * 1024 * 1024) {
          const pathParts = devPath.split("/");
          const toolName = pathParts[pathParts.length - 1] || "dev-cache";

          items.push({
            id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: devPath,
            sizeBytes: size,
            discoveredAt: new Date().toISOString(),
            category: "dev-cache",
            reason: `Development cache (${toolName}, ${(size / 1024 / 1024).toFixed(1)}MB)`,
            safeToDelete: true,
            confidence: 0.85,
            metadata: {
              toolName,
              sizeMB: Math.round(size / 1024 / 1024 * 10) / 10,
              warning: "Will be regenerated on next use",
            },
          });
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan dev path: ${devPath}`);
      }
    }

    return items;
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Cleaning ${items.length} system junk items`, {
      quarantine: options.quarantine,
    });

    const paths = items.map(item => item.path);
    const result = await FileOperations.safeDelete(paths, this.id, {
      quarantine: options.quarantine,
      dryRun: false,
      maxAge: 1, // Only delete items older than 1 day
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
