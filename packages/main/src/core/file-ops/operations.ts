// EKD Clean - Safe File Operations
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import crypto from "crypto";
import { PlatformPaths } from "../platform-adapters/paths";
import { QuarantineManager } from "./quarantine";
import { WhitelistManager } from "./whitelist";
import { Logger } from "../logger";

export type DeleteOptions = {
  dryRun?: boolean;
  backup?: boolean;
  quarantine?: boolean;
  maxAge?: number;
};

export type DeleteResult = {
  success: boolean;
  filesDeleted: number;
  spaceFreed: number;
  errors: string[];
  quarantineIds?: string[];
};

export class FileOperations {
  static async safeDelete(
    paths: string[],
    category: string,
    options: DeleteOptions = {}
  ): Promise<DeleteResult> {
    const result: DeleteResult = {
      success: true,
      filesDeleted: 0,
      spaceFreed: 0,
      errors: [],
      quarantineIds: [],
    };

    Logger.info(
      "FileOperations",
      `🗑️ Starting deletion of ${paths.length} paths`,
      {
        category,
        quarantine: options.quarantine,
        dryRun: options.dryRun,
      }
    );

    // Dry run - just report what would be deleted
    if (options.dryRun) {
      for (const path of paths) {
        try {
          if (existsSync(path)) {
            const stats = await fs.stat(path);
            if (stats.isFile()) {
              result.filesDeleted++;
              result.spaceFreed += stats.size;
            } else if (stats.isDirectory()) {
              const dirSize = await this.getDirectorySize(path);
              result.filesDeleted++;
              result.spaceFreed += dirSize;
            }
          }
        } catch (error) {
          // Ignore errors in dry run
        }
      }
      return result;
    }

    // Actual deletion
    for (const path of paths) {
      try {
        // Safety checks
        if (PlatformPaths.isProtectedPath(path)) {
          result.errors.push(`Protected path: ${path}`);
          Logger.warn("FileOperations", `⚠️ Skipped protected path: ${path}`);
          continue;
        }

        if (await WhitelistManager.isWhitelisted(path)) {
          result.errors.push(`Whitelisted: ${path}`);
          Logger.warn("FileOperations", `⚠️ Skipped whitelisted path: ${path}`);
          continue;
        }

        if (!existsSync(path)) {
          Logger.debug("FileOperations", `📁 Path already deleted: ${path}`);
          continue; // Already deleted
        }

        const stats = await fs.stat(path);

        // Check age requirement (only if specified)
        if (options.maxAge && options.maxAge > 0) {
          const ageInDays =
            (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays < options.maxAge) {
            Logger.debug(
              "FileOperations",
              `⏰ Skipping recent file: ${path} (${ageInDays.toFixed(1)} days old)`
            );
            continue;
          }
        }

        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        Logger.info("FileOperations", `🗂️ Processing: ${path} (${sizeMB}MB)`);

        // Quarantine if requested
        if (options.quarantine) {
          try {
            const quarantineId = await QuarantineManager.quarantineFile(
              path,
              category,
              { size: stats.size }
            );
            result.quarantineIds?.push(quarantineId);
            result.filesDeleted++;
            result.spaceFreed += stats.size;
            Logger.info(
              "FileOperations",
              `✅ Quarantined: ${path} (${sizeMB}MB)`
            );
          } catch (error) {
            const errorMsg = `Quarantine failed for ${path}: ${error instanceof Error ? error.message : "Unknown"}`;
            result.errors.push(errorMsg);
            Logger.error("FileOperations", `❌ ${errorMsg}`);
          }
        } else {
          // Direct deletion (use with caution)
          if (stats.isFile()) {
            await fs.unlink(path);
            result.filesDeleted++;
            result.spaceFreed += stats.size;
            Logger.info(
              "FileOperations",
              `🗑️ Deleted file: ${path} (${sizeMB}MB)`
            );
          } else if (stats.isDirectory()) {
            // Get directory size before deletion
            const dirSize = await this.getDirectorySize(path);
            const dirSizeMB = (dirSize / 1024 / 1024).toFixed(1);

            Logger.info(
              "FileOperations",
              `📂 Deleting directory: ${path} (${dirSizeMB}MB)`
            );

            // Recursively delete directory
            const dirResult = await this.deleteDirectory(
              path,
              category,
              options
            );
            result.filesDeleted += dirResult.filesDeleted;
            result.spaceFreed += dirResult.spaceFreed;
            result.errors.push(...dirResult.errors);

            Logger.info(
              "FileOperations",
              `✅ Directory deleted: ${path} (${dirSizeMB}MB, ${dirResult.filesDeleted} files)`
            );
          }
        }
      } catch (error) {
        const errorMsg = `Failed to delete ${path}: ${error instanceof Error ? error.message : "Unknown"}`;
        result.errors.push(errorMsg);
        Logger.error("FileOperations", `❌ ${errorMsg}`);
      }
    }

    Logger.info("FileOperations", `🏁 Deletion complete`, {
      filesDeleted: result.filesDeleted,
      spaceFreedMB: (result.spaceFreed / 1024 / 1024).toFixed(1),
      errors: result.errors.length,
      success: result.success,
    });

    result.success = result.errors.length === 0;
    return result;
  }

  private static async deleteDirectory(
    dirPath: string,
    category: string,
    options: DeleteOptions
  ): Promise<DeleteResult> {
    const result: DeleteResult = {
      success: true,
      filesDeleted: 0,
      spaceFreed: 0,
      errors: [],
      quarantineIds: [],
    };

    try {
      Logger.debug(
        "FileOperations",
        `📂 Processing directory contents: ${dirPath}`
      );
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isDirectory()) {
            const subResult = await this.deleteDirectory(
              fullPath,
              category,
              options
            );
            result.filesDeleted += subResult.filesDeleted;
            result.spaceFreed += subResult.spaceFreed;
            result.errors.push(...subResult.errors);
          } else {
            const stats = await fs.stat(fullPath);
            await fs.unlink(fullPath);
            result.filesDeleted++;
            result.spaceFreed += stats.size;
            Logger.debug(
              "FileOperations",
              `🗑️ Deleted file in directory: ${fullPath}`
            );
          }
        } catch (error) {
          const errorMsg = `Failed to delete ${fullPath}: ${error instanceof Error ? error.message : "Unknown"}`;
          result.errors.push(errorMsg);
          Logger.warn("FileOperations", `⚠️ ${errorMsg}`);
        }
      }

      // Try to remove the directory itself
      try {
        await fs.rmdir(dirPath);
        Logger.debug("FileOperations", `📁 Directory removed: ${dirPath}`);
      } catch (error) {
        // Directory may not be empty or other issues - try force removal
        try {
          await fs.rm(dirPath, { recursive: true, force: true });
          Logger.debug(
            "FileOperations",
            `🔥 Force removed directory: ${dirPath}`
          );
        } catch (forceError) {
          const errorMsg = `Failed to remove directory ${dirPath}: ${forceError instanceof Error ? forceError.message : "Unknown"}`;
          result.errors.push(errorMsg);
          Logger.warn("FileOperations", `⚠️ ${errorMsg}`);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to process directory ${dirPath}: ${error instanceof Error ? error.message : "Unknown"}`;
      result.errors.push(errorMsg);
      Logger.error("FileOperations", `❌ ${errorMsg}`);
    }

    return result;
  }

  static async calculateChecksum(filePath: string): Promise<string> {
    try {
      const hash = crypto.createHash("sha256");
      const data = await fs.readFile(filePath);
      hash.update(data);
      return hash.digest("hex");
    } catch (error) {
      throw new Error(
        `Failed to calculate checksum: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  }

  static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isDirectory()) {
            totalSize += await this.getDirectorySize(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          }
        } catch {
          // Ignore inaccessible files
        }
      }
    } catch {
      // Ignore inaccessible directories
    }

    return totalSize;
  }
}
