// EKD Clean - System Junk Scanner
// Built by EKD Digital

import { existsSync, promises as fs } from "fs";
import { join } from "path";
import { tmpdir, homedir } from "os";
import { BaseScanner } from "../scanner-core/BaseScanner";
import {
  ScanItem,
  ScanOptions,
  CleanResult,
  SupportedOS,
} from "../scanner-core/types";
import { FileOperations } from "../file-ops/operations";
import { Logger } from "../logger";
import { SmartCacheDiscovery } from "../scanner-core/SmartCacheDiscovery";
import { UserExclusionsManager } from "../safety/user-exclusions";
import { PermissionManager } from "../permissions/PermissionManager";

export class SystemJunkScanner extends BaseScanner {
  readonly id = "system-junk";
  readonly name = "System Junk";
  readonly description =
    "Clean system caches, temp files, and application junk";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting system junk scan");

    // Check permissions before scanning
    const permissionManager = PermissionManager.getInstance();
    const permissionSummary = await permissionManager.getPermissionSummary();

    if (!permissionSummary.hasRequiredPermissions) {
      Logger.warn(
        this.id,
        "Missing required permissions for thorough scanning",
        {
          missing: permissionSummary.missingCount,
          total: permissionSummary.totalCount,
        }
      );

      // Try to request permissions
      if (await permissionManager.shouldRequestPermissions()) {
        Logger.info(this.id, "🚨 REQUESTING PERMISSIONS FROM USER 🚨");
        const permissionGranted = await permissionManager.requestPermissions();
        Logger.info(this.id, "Permission request result", {
          granted: permissionGranted,
        });

        if (!permissionGranted) {
          Logger.warn(this.id, "User declined or cancelled permission request");
        }
      } else {
        Logger.info(
          this.id,
          "Permission manager says we should not request permissions"
        );
      }
    }

    const items: ScanItem[] = [];

    try {
      // Scan application caches
      const cacheItems = await this.scanApplicationCaches(options);
      items.push(...cacheItems);

      // Scan system temp files
      const tempItems = await this.scanTempFiles(options);
      items.push(...tempItems);

      // Scan development artifacts
      const devItems = await this.scanDevelopmentArtifacts(options);
      items.push(...devItems);
    } catch (error) {
      // Handle permission errors gracefully
      if (
        error instanceof Error &&
        (error.message.includes("EPERM") || error.message.includes("EACCES"))
      ) {
        await permissionManager.handlePermissionError(
          "system scan",
          error as NodeJS.ErrnoException
        );
      }
      Logger.error(this.id, "Scan failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    Logger.info(
      this.id,
      `System junk scan complete. Found ${items.length} items`
    );
    return items;
  }

  private async scanApplicationCaches(
    options: ScanOptions
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    // USE SMART DISCOVERY SYSTEM - automatically finds caches!
    Logger.info(this.id, "Using smart cache discovery system");

    try {
      const discoveries = await SmartCacheDiscovery.discoverCaches(0.1); // Min 0.1MB (100KB)

      Logger.info(
        this.id,
        `Smart discovery found ${discoveries.length} cache locations, total: ${discoveries.reduce((sum, d) => sum + d.sizeBytes, 0) / 1024 / 1024} MB`
      );

      // Debug: Log each discovery for troubleshooting
      discoveries.forEach((discovery) => {
        Logger.debug(
          this.id,
          `Found cache: ${discovery.path} (${(discovery.sizeBytes / 1024 / 1024).toFixed(1)}MB)`
        );
      });

      for (const discovery of discoveries) {
        if (options.cancelToken?.cancelled) break;

        // Check if user has excluded this path or category
        const excluded = await UserExclusionsManager.shouldExclude(
          discovery.path,
          discovery.category
        );

        if (excluded) {
          Logger.debug(this.id, `Skipping excluded path: ${discovery.path}`);
          continue;
        }

        // Convert discovery to ScanItem
        items.push({
          id: `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          path: discovery.path,
          sizeBytes: discovery.sizeBytes,
          discoveredAt: new Date().toISOString(),
          category: discovery.category,
          reason: `${discovery.description} (${(discovery.sizeBytes / 1024 / 1024).toFixed(1)}MB)`,
          safeToDelete: discovery.safeToDelete,
          confidence: discovery.confidence,
          metadata: {
            matched: discovery.matched,
            sizeMB: Math.round((discovery.sizeBytes / 1024 / 1024) * 10) / 10,
            category: discovery.category,
          },
        });

        // Report progress
        if (options.onProgress) {
          options.onProgress(items.length / Math.max(discoveries.length, 1));
        }
      }
    } catch (error) {
      Logger.error(this.id, "Smart cache discovery failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    return items;
  }

  private async scanTempFiles(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const minAge = 24 * 60 * 60 * 1000; // 24 hours

    // Multiple temp locations to check
    const tempLocations = [
      tmpdir(),
      "/private/tmp",
      "/var/tmp",
      join(homedir(), ".cache/tmp"),
      join(homedir(), "Library/Caches/Temporary Items"),
    ];

    for (const tempPath of tempLocations) {
      try {
        if (!existsSync(tempPath)) continue;

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
                if (size > 1024 * 1024) {
                  // Only directories > 1MB
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
                      sizeMB: Math.round((size / 1024 / 1024) * 10) / 10,
                    },
                  });
                }
              }
            }
          } catch (error) {
            // Skip files we can't access
          }
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan temp location: ${tempPath}`);
      }
    }

    return items;
  }

  private async scanDevelopmentArtifacts(
    options: ScanOptions
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    Logger.info(this.id, "Scanning development artifacts with smart discovery");

    try {
      // Use SmartCacheDiscovery to find dev caches
      const discoveries = await SmartCacheDiscovery.discoverCaches(1); // Min 1MB

      // Filter for dev-cache category
      const devDiscoveries = discoveries.filter(
        (d) => d.category === "dev-cache"
      );

      Logger.info(
        this.id,
        `Found ${devDiscoveries.length} development cache locations`
      );

      for (const discovery of devDiscoveries) {
        if (options.cancelToken?.cancelled) break;

        // Check if user has excluded this
        const excluded = await UserExclusionsManager.shouldExclude(
          discovery.path,
          discovery.category
        );

        if (excluded) {
          Logger.debug(this.id, `Skipping excluded path: ${discovery.path}`);
          continue;
        }

        items.push({
          id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          path: discovery.path,
          sizeBytes: discovery.sizeBytes,
          discoveredAt: new Date().toISOString(),
          category: discovery.category,
          reason: `${discovery.description} (${(discovery.sizeBytes / 1024 / 1024).toFixed(1)}MB)`,
          safeToDelete: discovery.safeToDelete,
          confidence: discovery.confidence,
          metadata: {
            matched: discovery.matched,
            sizeMB: Math.round((discovery.sizeBytes / 1024 / 1024) * 10) / 10,
            warning: "Will be regenerated on next use",
          },
        });
      }
    } catch (error) {
      Logger.error(this.id, "Failed to scan dev artifacts", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    return items;
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(
      this.id,
      `🧹 STARTING CLEAN: ${items.length} system junk items`,
      {
        quarantine: options.quarantine,
      }
    );

    const paths = items.map((item) => item.path);

    // Log what we're about to clean for debugging
    for (let i = 0; i < Math.min(paths.length, 10); i++) {
      const item = items[i];
      Logger.info(
        this.id,
        `📂 Will clean: ${item.path} (${(item.sizeBytes / 1024 / 1024).toFixed(1)}MB)`
      );
    }
    if (paths.length > 10) {
      Logger.info(this.id, `... and ${paths.length - 10} more items`);
    }

    const result = await FileOperations.safeDelete(paths, this.id, {
      quarantine: options.quarantine,
      dryRun: false,
      maxAge: 0, // ✅ FIX: Remove age restriction for cache files
    });

    Logger.info(this.id, "🏁 CLEAN COMPLETE", {
      filesDeleted: result.filesDeleted,
      spaceFreedMB: (result.spaceFreed / 1024 / 1024).toFixed(1),
      errors: result.errors.length,
      errorDetails: result.errors.length > 0 ? result.errors.slice(0, 5) : [],
    });

    // Log errors for debugging
    if (result.errors.length > 0) {
      Logger.error(this.id, "❌ Cleaning errors encountered:", {
        firstFewErrors: result.errors.slice(0, 3),
        totalErrors: result.errors.length,
      });
    }

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
