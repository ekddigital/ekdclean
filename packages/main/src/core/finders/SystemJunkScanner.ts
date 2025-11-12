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
import { ApplicationManager } from "../app-management/ApplicationManager";

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
      `🧹 STARTING ENHANCED CLEAN: ${items.length} system junk items`,
      {
        quarantine: options.quarantine,
      }
    );

    const paths = items.map((item) => item.path);

    // ✅ STEP 1: Analyze which applications are blocking file deletion
    const appManager = ApplicationManager.getInstance();
    const closurePrompt = await appManager.analyzeFileLocks(paths);

    let totalSpaceFreed = 0;
    let totalFilesDeleted = 0;
    let allErrors: string[] = [];

    if (closurePrompt) {
      Logger.info(this.id, `🚨 APPLICATIONS BLOCKING CLEANUP:`, {
        appsCount: closurePrompt.applications.length,
        estimatedSpaceMB: (
          closurePrompt.estimatedSpaceToFree /
          1024 /
          1024
        ).toFixed(1),
        apps: closurePrompt.applications.map((app) => app.name),
      });

      // ✅ REQUEST USER CONSENT THROUGH UI INSTEAD OF AUTO-CLOSING
      Logger.info(
        this.id,
        `💬 REQUESTING USER CONSENT FOR APPLICATION CLOSURE`
      );
      Logger.info(this.id, `🎯 User Prompt: ${closurePrompt.message}`);

      // Instead of automatically closing apps, we need to:
      // 1. Send the closure prompt to the UI via IPC
      // 2. Show the ApplicationBlockingModal
      // 3. Wait for user decision
      // 4. Only proceed based on user choice

      // For now, we'll add detailed info to errors to inform the user
      // The actual UI integration should be handled by the cleaning coordinator
      const appNames = closurePrompt.applications
        .map((app) => app.name)
        .join(", ");
      const spaceMB = (
        closurePrompt.estimatedSpaceToFree /
        1024 /
        1024
      ).toFixed(1);

      allErrors.push(
        `⚠️ Applications are blocking cleanup: ${appNames}. ` +
          `Close these applications to free up ${spaceMB} MB of space. ` +
          `Files currently in use cannot be cleaned.`
      );

      // Mark the blocked files by adding them to errors
      for (const app of closurePrompt.applications) {
        for (const filePath of app.usingFiles) {
          allErrors.push(`File blocked by ${app.name}: ${filePath}`);
        }
      }

      Logger.warn(this.id, `🛑 CLEANING BLOCKED - User intervention required`, {
        blockingApps: closurePrompt.applications.length,
        blockedPaths: closurePrompt.affectedPaths.length,
        recommendation: "Show ApplicationBlockingModal to user",
      });
    }

    // ✅ STEP 2: Attempt cleaning with enhanced error handling
    Logger.info(
      this.id,
      `🗑️ Proceeding with file deletion (${paths.length} paths)`
    );

    // Group paths by category for better error reporting
    const pathsByCategory = this.groupPathsByCategory(items);

    for (const [category, categoryItems] of pathsByCategory.entries()) {
      const categoryPaths = categoryItems.map((item) => item.path);

      Logger.info(
        this.id,
        `🧹 Cleaning ${category}: ${categoryPaths.length} items`
      );

      const result = await FileOperations.safeDelete(categoryPaths, category, {
        quarantine: options.quarantine,
        dryRun: false,
        maxAge: 0, // Remove age restrictions for cache cleaning
      });

      totalFilesDeleted += result.filesDeleted;
      totalSpaceFreed += result.spaceFreed;
      allErrors.push(...result.errors);

      // Enhanced error reporting by category
      if (result.errors.length > 0) {
        Logger.warn(this.id, `⚠️ Errors in ${category}:`, {
          errorsCount: result.errors.length,
          sampleErrors: result.errors.slice(0, 3),
        });
      } else {
        Logger.info(this.id, `✅ ${category} cleaned successfully:`, {
          files: result.filesDeleted,
          spaceMB: (result.spaceFreed / 1024 / 1024).toFixed(1),
        });
      }
    }

    // ✅ STEP 3: Analyze remaining issues and provide guidance
    await this.analyzeCleaningResults(allErrors, paths);

    Logger.info(this.id, "🏁 ENHANCED CLEAN COMPLETE", {
      totalFilesDeleted,
      totalSpaceFreedMB: (totalSpaceFreed / 1024 / 1024).toFixed(1),
      totalErrors: allErrors.length,
      categoriesProcessed: pathsByCategory.size,
    });

    return {
      success: allErrors.length === 0,
      itemsCleaned: totalFilesDeleted,
      spaceFreed: totalSpaceFreed,
      errors: allErrors,
      quarantined: options.quarantine,
    };
  }

  /**
   * Group scan items by category for organized cleaning
   */
  private groupPathsByCategory(items: ScanItem[]): Map<string, ScanItem[]> {
    const grouped = new Map<string, ScanItem[]>();

    for (const item of items) {
      const category = item.category || "unknown";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    }

    return grouped;
  }

  /**
   * Analyze cleaning results and provide user guidance
   */
  private async analyzeCleaningResults(
    errors: string[],
    originalPaths: string[]
  ): Promise<void> {
    if (errors.length === 0) {
      Logger.info(this.id, "🎉 All files cleaned successfully!");
      return;
    }

    // Categorize errors
    const permissionErrors = errors.filter(
      (err) =>
        err.includes("EACCES") ||
        err.includes("EPERM") ||
        err.includes("permission denied")
    );

    const inUseErrors = errors.filter(
      (err) => err.includes("EBUSY") || err.includes("resource busy")
    );

    const notFoundErrors = errors.filter(
      (err) => err.includes("ENOENT") || err.includes("no such file")
    );

    // Provide specific guidance
    if (permissionErrors.length > 0) {
      Logger.warn(
        this.id,
        `🔐 ${permissionErrors.length} permission-related errors detected`
      );
      Logger.info(
        this.id,
        "💡 SUGGESTION: Grant Full Disk Access to EKD Clean in System Settings > Security & Privacy"
      );
    }

    if (inUseErrors.length > 0) {
      Logger.warn(
        this.id,
        `📱 ${inUseErrors.length} files are currently in use by applications`
      );
      Logger.info(
        this.id,
        "💡 SUGGESTION: Close related applications and try cleaning again"
      );
    }

    if (notFoundErrors.length > 0) {
      Logger.info(
        this.id,
        `✅ ${notFoundErrors.length} files were already cleaned (no longer exist)`
      );
    }

    // Calculate success rate
    const totalAttempted = originalPaths.length;
    const failed = errors.length - notFoundErrors.length; // Don't count "already deleted" as failures
    const successRate = ((totalAttempted - failed) / totalAttempted) * 100;

    Logger.info(this.id, `📊 Cleaning Summary:`, {
      attempted: totalAttempted,
      succeeded: totalAttempted - failed,
      failed: failed,
      successRate: `${successRate.toFixed(1)}%`,
    });
  }

  async restore(quarantineId: string): Promise<boolean> {
    Logger.info(this.id, `Restoring quarantined item: ${quarantineId}`);
    const { QuarantineManager } = await import("../file-ops/quarantine");
    return await QuarantineManager.restoreFile(quarantineId);
  }

  /**
   * Enhanced cleaning process with application management
   */
  async performEnhancedCleaning(
    filePaths: string[],
    options: {
      onProgress?: (progress: {
        current?: number;
        total?: number;
        currentStep?: string;
        filesDeleted?: number;
        spaceFreed?: number;
      }) => void;
    } = {}
  ): Promise<{
    totalFilesDeleted: number;
    totalSpaceFreed: number;
    errors: string[];
    applicationsClosed: number;
  }> {
    const { ApplicationManager } = await import(
      "../app-management/ApplicationManager"
    );
    const { FileOperations } = await import("../file-ops/operations");

    const applicationManager = new ApplicationManager();
    let totalFilesDeleted = 0;
    let totalSpaceFreed = 0;
    let applicationsClosed = 0;
    const errors: string[] = [];

    try {
      Logger.info(
        this.id,
        `Starting enhanced cleaning of ${filePaths.length} file paths`
      );

      options.onProgress?.({
        current: 0,
        total: filePaths.length,
        currentStep: "Analyzing application locks...",
        filesDeleted: 0,
        spaceFreed: 0,
      });

      // Step 1: Analyze file locks
      const lockAnalysis = await applicationManager.analyzeFileLocks(filePaths);

      if (
        lockAnalysis &&
        lockAnalysis.applications &&
        lockAnalysis.applications.length > 0
      ) {
        Logger.info(
          this.id,
          `Found ${lockAnalysis.applications.length} applications blocking cleanup:`
        );
        lockAnalysis.applications.forEach((app: any) => {
          Logger.info(
            this.id,
            `- ${app.name} (PID: ${app.processId}) using ${app.usingFiles.length} files`
          );
        });

        // ✅ PROPER USER CONSENT FLOW - DO NOT AUTO-CLOSE
        Logger.warn(
          this.id,
          `🛑 ENHANCED CLEANING BLOCKED - Applications blocking cleanup`
        );
        Logger.info(
          this.id,
          `💡 RECOMMENDATION: Show ApplicationBlockingModal to request user consent`
        );

        // Add descriptive errors instead of auto-closing
        const appNames = lockAnalysis.applications
          .map((app: any) => app.name)
          .join(", ");
        const spaceMB = (
          lockAnalysis.estimatedSpaceToFree /
          1024 /
          1024
        ).toFixed(1);

        errors.push(
          `⚠️ Enhanced cleaning blocked by applications: ${appNames}. ` +
            `Close these applications to free up ${spaceMB} MB. ` +
            `User consent required before closing any applications.`
        );

        // Mark each blocked file
        for (const app of lockAnalysis.applications) {
          for (const filePath of app.usingFiles) {
            errors.push(`File blocked by ${app.name}: ${filePath}`);
          }
        }

        // Skip the automatic closure - this should be handled by UI
        Logger.info(
          this.id,
          `⏭️ Skipping automatic application closure - user consent required`
        );
      }

      // Step 4: Proceed with actual file deletion using the existing safeDelete method
      options.onProgress?.({
        current: 2,
        total: 4,
        currentStep: "Cleaning files...",
        filesDeleted: totalFilesDeleted,
        spaceFreed: totalSpaceFreed,
      });

      const deleteResult = await FileOperations.safeDelete(
        filePaths,
        "Enhanced Clean",
        {
          quarantine: true,
          backup: false,
        }
      );

      totalFilesDeleted = deleteResult.filesDeleted;
      totalSpaceFreed = deleteResult.spaceFreed;
      errors.push(...deleteResult.errors);

      // Step 5: Final summary
      options.onProgress?.({
        current: 4,
        total: 4,
        currentStep: "Cleanup complete",
        filesDeleted: totalFilesDeleted,
        spaceFreed: totalSpaceFreed,
      });

      Logger.info(
        this.id,
        `Enhanced cleaning completed: ${totalFilesDeleted} files deleted, ${totalSpaceFreed} bytes freed, ${applicationsClosed} apps closed, ${errors.length} errors`
      );

      return {
        totalFilesDeleted,
        totalSpaceFreed,
        errors,
        applicationsClosed,
      };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      Logger.error(this.id, "Enhanced cleaning failed:", { error: errorMsg });
      errors.push(`Enhanced cleaning failed: ${errorMsg}`);

      return {
        totalFilesDeleted,
        totalSpaceFreed,
        errors,
        applicationsClosed,
      };
    }
  }
}
