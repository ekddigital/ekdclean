// EKD Clean - Privacy Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { BaseScanner } from "../scanner-core/BaseScanner";
import { ScanItem, ScanOptions, CleanResult, SupportedOS } from "../scanner-core/types";
import { PlatformPaths } from "../platform-adapters/paths";
import { FileOperations } from "../file-ops/operations";
import { Logger } from "../logger";

export class PrivacyScanner extends BaseScanner {
  readonly id = "privacy";
  readonly name = "Privacy";
  readonly description = "Clean browser data, logs, and privacy traces";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting privacy scan");
    const items: ScanItem[] = [];

    // Scan browser caches
    const browserItems = await this.scanBrowserData(options);
    items.push(...browserItems);

    // Scan application logs
    const logItems = await this.scanPrivacyLogs(options);
    items.push(...logItems);

    // Scan recent files lists
    const recentItems = await this.scanRecentFiles(options);
    items.push(...recentItems);

    Logger.info(this.id, `Privacy scan complete. Found ${items.length} items`);
    return items;
  }

  private async scanBrowserData(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const browserPaths = PlatformPaths.getBrowserCachePaths();

    for (const browserPath of browserPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(browserPath)) continue;

        // Scan for cache directories
        const cacheItems = await this.scanBrowserCache(browserPath, options);
        items.push(...cacheItems);

        // Scan for history/cookies (but exclude passwords)
        const historyItems = await this.scanBrowserHistory(browserPath, options);
        items.push(...historyItems);
      } catch (error) {
        Logger.debug(this.id, `Failed to scan browser path: ${browserPath}`);
      }
    }

    return items;
  }

  private async scanBrowserCache(
    browserPath: string,
    options: ScanOptions
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    try {
      const cacheDirs = ["Cache", "GPUCache", "Code Cache", "DawnCache"];

      for (const cacheDir of cacheDirs) {
        if (options.cancelToken?.cancelled) break;

        const cachePath = join(browserPath, cacheDir);
        if (!existsSync(cachePath)) continue;

        try {
          const size = await FileOperations.getDirectorySize(cachePath);
          if (size > 0) {
            items.push({
              id: `browser_cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: cachePath,
              sizeBytes: size,
              discoveredAt: new Date().toISOString(),
              category: "browser-cache",
              reason: `Browser cache directory (${(size / 1024 / 1024).toFixed(1)}MB)`,
              safeToDelete: true,
              confidence: 0.95,
              metadata: {
                browserPath,
                cacheType: cacheDir,
              },
            });
          }
        } catch (error) {
          Logger.debug(this.id, `Failed to scan cache: ${cachePath}`);
        }
      }
    } catch (error) {
      Logger.debug(this.id, `Failed to scan browser cache: ${browserPath}`);
    }

    return items;
  }

  private async scanBrowserHistory(
    browserPath: string,
    options: ScanOptions
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    try {
      const historyFiles = ["History", "Cookies", "Web Data"];

      for (const historyFile of historyFiles) {
        if (options.cancelToken?.cancelled) break;

        const historyPath = join(browserPath, historyFile);
        if (!existsSync(historyPath)) continue;

        try {
          const stats = await fs.stat(historyPath);
          
          items.push({
            id: `browser_history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: historyPath,
            sizeBytes: stats.size,
            discoveredAt: new Date().toISOString(),
            category: "browser-history",
            reason: `Browser ${historyFile.toLowerCase()} data`,
            safeToDelete: false, // User should decide
            confidence: 0.7,
            metadata: {
              browserPath,
              dataType: historyFile,
              warning: "This will clear browsing history/cookies",
            },
          });
        } catch (error) {
          Logger.debug(this.id, `Failed to access: ${historyPath}`);
        }
      }
    } catch (error) {
      Logger.debug(this.id, `Failed to scan browser history: ${browserPath}`);
    }

    return items;
  }

  private async scanPrivacyLogs(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const logPaths = PlatformPaths.getLogPaths();

    for (const logPath of logPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(logPath)) continue;

        // Only scan user logs, not system logs
        if (logPath.includes(homedir())) {
          const logItems = await this.scanLogDirectory(logPath, options, 0);
          items.push(...logItems);
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan log path: ${logPath}`);
      }
    }

    return items;
  }

  private async scanLogDirectory(
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
          if (entry.isFile() && entry.name.endsWith(".log")) {
            const stats = await fs.stat(fullPath);
            const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

            // Only report logs older than 7 days
            if (ageInDays >= 7) {
              items.push({
                id: `privacy_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                path: fullPath,
                sizeBytes: stats.size,
                discoveredAt: new Date().toISOString(),
                category: "privacy-log",
                reason: `Application log file (${ageInDays.toFixed(0)} days old)`,
                safeToDelete: true,
                confidence: 0.85,
                metadata: {
                  fileName: entry.name,
                  ageInDays: Math.floor(ageInDays),
                },
              });
            }
          } else if (entry.isDirectory() && !entry.name.startsWith(".")) {
            const subItems = await this.scanLogDirectory(fullPath, options, depth + 1);
            items.push(...subItems);
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

  private async scanRecentFiles(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const recentPaths = [
      join(home, "Library/Application Support/com.apple.sharedfilelist"),
      join(home, "AppData/Roaming/Microsoft/Windows/Recent"),
      join(home, ".local/share/recently-used.xbel"),
    ];

    for (const recentPath of recentPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(recentPath)) continue;

        const stats = await fs.stat(recentPath);
        
        if (stats.isFile()) {
          items.push({
            id: `recent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: recentPath,
            sizeBytes: stats.size,
            discoveredAt: new Date().toISOString(),
            category: "recent-files",
            reason: "Recent files list",
            safeToDelete: true,
            confidence: 0.8,
            metadata: {
              warning: "Clears recent files list",
            },
          });
        } else if (stats.isDirectory()) {
          const size = await FileOperations.getDirectorySize(recentPath);
          if (size > 0) {
            items.push({
              id: `recent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: recentPath,
              sizeBytes: size,
              discoveredAt: new Date().toISOString(),
              category: "recent-files",
              reason: "Recent files directory",
              safeToDelete: true,
              confidence: 0.8,
              metadata: {
                warning: "Clears recent files history",
              },
            });
          }
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan recent files: ${recentPath}`);
      }
    }

    return items;
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Cleaning ${items.length} privacy items`, {
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
