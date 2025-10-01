// EKD Clean - Safe File Operations
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import crypto from "crypto";
import { PlatformPaths } from "../platform-adapters/paths";
import { QuarantineManager } from "./quarantine";
import { WhitelistManager } from "./whitelist";

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

    // Dry run - just report what would be deleted
    if (options.dryRun) {
      for (const path of paths) {
        try {
          if (existsSync(path)) {
            const stats = await fs.stat(path);
            if (stats.isFile()) {
              result.filesDeleted++;
              result.spaceFreed += stats.size;
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
          continue;
        }

        if (await WhitelistManager.isWhitelisted(path)) {
          result.errors.push(`Whitelisted: ${path}`);
          continue;
        }

        if (!existsSync(path)) {
          continue; // Already deleted
        }

        const stats = await fs.stat(path);

        // Check age requirement
        if (options.maxAge) {
          const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          if (ageInDays < options.maxAge) {
            continue;
          }
        }

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
          } catch (error) {
            result.errors.push(
              `Quarantine failed for ${path}: ${error instanceof Error ? error.message : "Unknown"}`
            );
          }
        } else {
          // Direct deletion (use with caution)
          if (stats.isFile()) {
            await fs.unlink(path);
            result.filesDeleted++;
            result.spaceFreed += stats.size;
          } else if (stats.isDirectory()) {
            // Recursively delete directory
            const dirResult = await this.deleteDirectory(path, category, options);
            result.filesDeleted += dirResult.filesDeleted;
            result.spaceFreed += dirResult.spaceFreed;
            result.errors.push(...dirResult.errors);
          }
        }
      } catch (error) {
        result.errors.push(
          `Failed to delete ${path}: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    }

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
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isDirectory()) {
            const subResult = await this.deleteDirectory(fullPath, category, options);
            result.filesDeleted += subResult.filesDeleted;
            result.spaceFreed += subResult.spaceFreed;
            result.errors.push(...subResult.errors);
          } else {
            const stats = await fs.stat(fullPath);
            await fs.unlink(fullPath);
            result.filesDeleted++;
            result.spaceFreed += stats.size;
          }
        } catch (error) {
          result.errors.push(
            `Failed to delete ${fullPath}: ${error instanceof Error ? error.message : "Unknown"}`
          );
        }
      }

      // Try to remove the directory itself
      try {
        await fs.rmdir(dirPath);
      } catch {
        // Directory may not be empty or other issues
      }
    } catch (error) {
      result.errors.push(
        `Failed to process directory ${dirPath}: ${error instanceof Error ? error.message : "Unknown"}`
      );
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
      throw new Error(`Failed to calculate checksum: ${error instanceof Error ? error.message : "Unknown"}`);
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
