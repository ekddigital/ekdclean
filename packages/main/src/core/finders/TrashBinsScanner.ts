// EKD Clean - Trash Bins Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { BaseScanner } from "../scanner-core/BaseScanner";
import {
  ScanItem,
  ScanOptions,
  CleanResult,
  SupportedOS,
} from "../scanner-core/types";
import { PlatformPaths } from "../platform-adapters/paths";
import { FileOperations } from "../file-ops/operations";
import { Logger } from "../logger";
import { UserExclusionsManager } from "../safety/user-exclusions";
import { PermissionManager } from "../permissions/PermissionManager";

export class TrashBinsScanner extends BaseScanner {
  readonly id = "trash-bins";
  readonly name = "Trash Bins";
  readonly description = "Scan all OS trash/recycle bin locations";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting trash bins scan");

    // Check permissions for trash access
    const permissionManager = PermissionManager.getInstance();

    const items: ScanItem[] = [];
    const trashPaths = PlatformPaths.getTrashPaths();

    for (const trashPath of trashPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(trashPath)) continue;

        // Check if user has excluded trash scanning
        const excluded = await UserExclusionsManager.shouldExclude(
          trashPath,
          "trash"
        );

        if (excluded) {
          Logger.debug(this.id, `Skipping excluded trash path: ${trashPath}`);
          continue;
        }

        const trashItems = await this.scanTrashLocation(trashPath);
        items.push(...trashItems);

        if (options.onProgress) {
          const progress = items.length / (trashPaths.length * 10); // Estimate
          options.onProgress(Math.min(progress, 0.9));
        }
      } catch (error) {
        // Handle permission errors specifically
        if (error instanceof Error && error.message.includes("EPERM")) {
          await permissionManager.handlePermissionError(
            trashPath,
            error as NodeJS.ErrnoException
          );
        }

        Logger.warn(this.id, `Failed to scan trash location: ${trashPath}`, {
          error: error instanceof Error ? error.message : "Unknown",
        });
      }
    }

    if (options.onProgress) options.onProgress(1.0);
    Logger.info(this.id, `Trash scan complete. Found ${items.length} items`);

    return items;
  }

  private async scanTrashLocation(trashPath: string): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    try {
      const entries = await fs.readdir(trashPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(trashPath, entry.name);

        try {
          const stats = await fs.stat(fullPath);
          const ageInDays =
            (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

          items.push({
            id: `trash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: fullPath,
            sizeBytes: stats.size,
            discoveredAt: new Date().toISOString(),
            category: "trash",
            reason: `File in trash (${ageInDays.toFixed(0)} days old)`,
            safeToDelete: true,
            confidence: 1.0, // Trash is always safe to delete
            metadata: {
              fileName: entry.name,
              ageInDays: Math.floor(ageInDays),
              isDirectory: entry.isDirectory(),
              trashLocation: trashPath,
            },
          });
        } catch (error) {
          // Skip files we can't access
          Logger.debug(this.id, `Skipping inaccessible file: ${fullPath}`);
        }
      }
    } catch (error) {
      Logger.warn(this.id, `Failed to read trash directory: ${trashPath}`, {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    return items;
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Cleaning ${items.length} trash items`, {
      quarantine: options.quarantine,
    });

    const paths = items.map((item) => item.path);
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
    // Restoration is handled by QuarantineManager
    const { QuarantineManager } = await import("../file-ops/quarantine");
    return await QuarantineManager.restoreFile(quarantineId);
  }
}
