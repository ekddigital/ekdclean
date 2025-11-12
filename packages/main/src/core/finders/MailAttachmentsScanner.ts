// EKD Clean - Mail Attachments Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { BaseScanner } from "../scanner-core/BaseScanner";
import {
  ScanItem,
  ScanOptions,
  CleanResult,
  SupportedOS,
} from "../scanner-core/types";
import { FileOperations } from "../file-ops/operations";
import { Logger } from "../logger";
import { UserExclusionsManager } from "../safety/user-exclusions";
import { PermissionManager } from "../permissions/PermissionManager";

export class MailAttachmentsScanner extends BaseScanner {
  readonly id = "mail-attachments";
  readonly name = "Mail Attachments";
  readonly description = "Find cached mail attachments and large email data";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  private minSizeBytes = 5 * 1024 * 1024; // 5MB minimum

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting mail attachments scan");

    // Check if mail scanning is enabled by user
    const mailDisabled = await UserExclusionsManager.shouldExclude(
      "",
      "mail-attachments"
    );
    if (mailDisabled) {
      Logger.info(
        this.id,
        "Mail attachments scanning disabled by user preferences"
      );
      return [];
    }

    const permissionManager = PermissionManager.getInstance();
    const items: ScanItem[] = [];

    try {
      // Scan Apple Mail attachments (macOS)
      const appleMailItems = await this.scanAppleMail(options);
      items.push(...appleMailItems);

      // Scan Outlook attachments (Windows/Mac)
      const outlookItems = await this.scanOutlook(options);
      items.push(...outlookItems);

      // Scan Thunderbird attachments
      const thunderbirdItems = await this.scanThunderbird(options);
      items.push(...thunderbirdItems);
    } catch (error) {
      // Handle permission errors for mail directories
      if (error instanceof Error && error.message.includes("EPERM")) {
        await permissionManager.handlePermissionError(
          "mail directories",
          error as NodeJS.ErrnoException
        );
      }
      Logger.error(this.id, "Mail scan failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    Logger.info(
      this.id,
      `Mail attachments scan complete. Found ${items.length} items`
    );
    return items;
  }

  private async scanAppleMail(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const mailPaths = [
      join(home, "Library/Mail/V**/MailData/Attachments"),
      join(home, "Library/Mail Downloads"),
    ];

    for (const mailPath of mailPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        // Handle glob patterns
        const basePath = mailPath.includes("*")
          ? join(home, "Library/Mail")
          : mailPath;

        if (!existsSync(basePath)) continue;

        const foundItems = await this.scanMailDirectory(
          basePath,
          "Apple Mail",
          options,
          0
        );
        items.push(...foundItems);
      } catch (error) {
        Logger.debug(this.id, `Failed to scan Apple Mail: ${mailPath}`);
      }
    }

    return items;
  }

  private async scanOutlook(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const outlookPaths = [
      join(
        home,
        "Library/Group Containers/UBF8T346G9.Office/Outlook/Outlook 15 Profiles"
      ),
      join(home, "Documents/Outlook Files"),
      join(home, "AppData/Local/Microsoft/Outlook"),
    ];

    for (const outlookPath of outlookPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(outlookPath)) continue;

        const foundItems = await this.scanMailDirectory(
          outlookPath,
          "Outlook",
          options,
          0
        );
        items.push(...foundItems);
      } catch (error) {
        Logger.debug(this.id, `Failed to scan Outlook: ${outlookPath}`);
      }
    }

    return items;
  }

  private async scanThunderbird(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const thunderbirdPaths = [
      join(home, "Library/Thunderbird/Profiles"),
      join(home, ".thunderbird"),
      join(home, "AppData/Roaming/Thunderbird/Profiles"),
    ];

    for (const tbPath of thunderbirdPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(tbPath)) continue;

        const foundItems = await this.scanMailDirectory(
          tbPath,
          "Thunderbird",
          options,
          0
        );
        items.push(...foundItems);
      } catch (error) {
        Logger.debug(this.id, `Failed to scan Thunderbird: ${tbPath}`);
      }
    }

    return items;
  }

  private async scanMailDirectory(
    dirPath: string,
    mailClient: string,
    options: ScanOptions,
    depth: number
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const maxDepth = 3;

    if (depth > maxDepth || options.cancelToken?.cancelled) {
      return items;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (options.cancelToken?.cancelled) break;

        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isFile()) {
            const stats = await fs.stat(fullPath);

            // Only report large attachments
            if (stats.size >= this.minSizeBytes) {
              const ageInDays =
                (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
              const sizeMB = stats.size / (1024 * 1024);

              items.push({
                id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                path: fullPath,
                sizeBytes: stats.size,
                discoveredAt: new Date().toISOString(),
                category: "mail-attachment",
                reason: `${mailClient} cached attachment (${sizeMB.toFixed(1)}MB, ${ageInDays.toFixed(0)} days old)`,
                safeToDelete: false, // User should review attachments
                confidence: 0.5, // Low confidence - user should verify
                metadata: {
                  fileName: entry.name,
                  mailClient,
                  sizeMB: Math.round(sizeMB * 10) / 10,
                  ageInDays: Math.floor(ageInDays),
                },
              });
            }
          } else if (entry.isDirectory()) {
            const subItems = await this.scanMailDirectory(
              fullPath,
              mailClient,
              options,
              depth + 1
            );
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

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Cleaning ${items.length} mail attachment items`, {
      quarantine: options.quarantine,
    });

    // Mail attachments should ALWAYS be quarantined for safety
    const paths = items.map((item) => item.path);
    const result = await FileOperations.safeDelete(paths, this.id, {
      quarantine: true, // Force quarantine
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
      quarantined: true,
    };
  }

  async restore(quarantineId: string): Promise<boolean> {
    Logger.info(this.id, `Restoring quarantined item: ${quarantineId}`);
    const { QuarantineManager } = await import("../file-ops/quarantine");
    return await QuarantineManager.restoreFile(quarantineId);
  }
}
