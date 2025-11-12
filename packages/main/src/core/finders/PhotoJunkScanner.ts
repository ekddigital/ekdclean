// EKD Clean - Photo Junk Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join, extname } from "path";
import { homedir } from "os";
import crypto from "crypto";
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

export class PhotoJunkScanner extends BaseScanner {
  readonly id = "photo-junk";
  readonly name = "Photo Junk";
  readonly description =
    "Find duplicate photos, thumbnails, and photo cache files";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  private photoExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".heic",
    ".heif",
    ".raw",
    ".cr2",
    ".nef",
  ];
  private thumbnailPatterns = ["thumb", "thumbnail", ".thumb", "_thumb"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting photo junk scan");

    // Check if photo scanning is enabled by user
    const photosEnabled = await UserExclusionsManager.shouldExclude(
      "",
      "photo-junk"
    );
    if (photosEnabled) {
      Logger.info(this.id, "Photo junk scanning disabled by user preferences");
      return [];
    }

    const permissionManager = PermissionManager.getInstance();
    const items: ScanItem[] = [];

    try {
      // Scan for photo caches
      const cacheItems = await this.scanPhotoCaches(options);
      items.push(...cacheItems);

      // Scan for duplicate photos
      const duplicates = await this.scanDuplicates(options);
      items.push(...duplicates);

      // Scan for thumbnails
      const thumbnails = await this.scanThumbnails(options);
      items.push(...thumbnails);
    } catch (error) {
      // Handle permission errors
      if (error instanceof Error && error.message.includes("EPERM")) {
        await permissionManager.handlePermissionError(
          "photo libraries",
          error as NodeJS.ErrnoException
        );
      }
      Logger.error(this.id, "Photo scan failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    Logger.info(
      this.id,
      `Photo junk scan complete. Found ${items.length} items`
    );
    return items;
  }

  private async scanPhotoCaches(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const cachePaths = [
      join(home, "Library/Caches/com.apple.Photos"),
      join(home, "Library/Caches/com.apple.iPhoto"),
      join(
        home,
        "AppData/Local/Packages/Microsoft.Windows.Photos_*/LocalCache"
      ),
    ];

    for (const cachePath of cachePaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(cachePath)) continue;

        // Check if user has excluded this path
        const excluded = await UserExclusionsManager.shouldExclude(
          cachePath,
          "photo-cache"
        );

        if (excluded) {
          Logger.debug(this.id, `Skipping excluded photo cache: ${cachePath}`);
          continue;
        }

        const size = await FileOperations.getDirectorySize(cachePath);
        if (size > 0) {
          items.push({
            id: `photo_cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: cachePath,
            sizeBytes: size,
            discoveredAt: new Date().toISOString(),
            category: "photo-cache",
            reason: `Photo application cache (${(size / 1024 / 1024).toFixed(1)}MB)`,
            safeToDelete: true,
            confidence: 0.9,
            metadata: {
              cacheType: "photo-app",
            },
          });
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan photo cache: ${cachePath}`);
      }
    }

    return items;
  }

  private async scanDuplicates(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();
    const searchPaths = [join(home, "Pictures"), join(home, "Downloads")];

    const fileHashes = new Map<string, string[]>();

    for (const searchPath of searchPaths) {
      if (options.cancelToken?.cancelled) break;
      if (!existsSync(searchPath)) continue;

      try {
        await this.collectFileHashes(searchPath, fileHashes, options, 0);
      } catch (error) {
        Logger.warn(this.id, `Failed to scan for duplicates in: ${searchPath}`);
      }
    }

    // Find duplicates (files with same hash)
    for (const [hash, paths] of fileHashes.entries()) {
      if (paths.length > 1) {
        // Sort by modification time (keep newest)
        const pathsWithStats = await Promise.all(
          paths.map(async (path) => {
            try {
              const stats = await fs.stat(path);
              return { path, mtime: stats.mtime.getTime(), size: stats.size };
            } catch {
              return null;
            }
          })
        );

        const validPaths = pathsWithStats.filter(
          (p): p is NonNullable<typeof p> => p !== null
        );
        validPaths.sort((a, b) => b.mtime - a.mtime);

        // Mark all but the newest as duplicates
        for (let i = 1; i < validPaths.length; i++) {
          items.push({
            id: `duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: validPaths[i].path,
            sizeBytes: validPaths[i].size,
            discoveredAt: new Date().toISOString(),
            category: "duplicate-photo",
            reason: `Duplicate of ${validPaths[0].path}`,
            safeToDelete: false, // User should review
            confidence: 0.8,
            metadata: {
              hash,
              keepPath: validPaths[0].path,
              duplicateCount: validPaths.length,
            },
          });
        }
      }
    }

    return items;
  }

  private async collectFileHashes(
    dirPath: string,
    hashes: Map<string, string[]>,
    options: ScanOptions,
    depth: number
  ): Promise<void> {
    if (depth > 3 || options.cancelToken?.cancelled) return;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (options.cancelToken?.cancelled) break;
        if (entry.name.startsWith(".")) continue;

        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isFile() && this.isPhotoFile(entry.name)) {
            const stats = await fs.stat(fullPath);
            // Only hash files under 50MB to avoid performance issues
            if (stats.size < 50 * 1024 * 1024) {
              const hash = await this.quickHash(fullPath, stats.size);
              const existing = hashes.get(hash) || [];
              existing.push(fullPath);
              hashes.set(hash, existing);
            }
          } else if (entry.isDirectory()) {
            await this.collectFileHashes(fullPath, hashes, options, depth + 1);
          }
        } catch (error) {
          Logger.debug(this.id, `Failed to process: ${fullPath}`);
        }
      }
    } catch (error) {
      Logger.warn(this.id, `Failed to read directory: ${dirPath}`);
    }
  }

  private async scanThumbnails(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const home = homedir();

    const searchPaths = [
      join(home, "Library/Caches"),
      join(home, ".cache"),
      join(home, "AppData/Local/Temp"),
    ];

    for (const searchPath of searchPaths) {
      if (options.cancelToken?.cancelled) break;
      if (!existsSync(searchPath)) continue;

      try {
        const thumbs = await this.findThumbnails(searchPath, options, 0);
        items.push(...thumbs);
      } catch (error) {
        Logger.debug(this.id, `Failed to scan thumbnails in: ${searchPath}`);
      }
    }

    return items;
  }

  private async findThumbnails(
    dirPath: string,
    options: ScanOptions,
    depth: number
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    if (depth > 2 || options.cancelToken?.cancelled) return items;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (options.cancelToken?.cancelled) break;

        const fullPath = join(dirPath, entry.name);
        const lowerName = entry.name.toLowerCase();

        try {
          if (entry.isFile() && this.isThumbnailFile(lowerName)) {
            const stats = await fs.stat(fullPath);
            items.push({
              id: `thumbnail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: fullPath,
              sizeBytes: stats.size,
              discoveredAt: new Date().toISOString(),
              category: "thumbnail",
              reason: "Thumbnail cache file",
              safeToDelete: true,
              confidence: 0.85,
              metadata: {
                fileName: entry.name,
              },
            });
          } else if (entry.isDirectory() && !entry.name.startsWith(".")) {
            const subItems = await this.findThumbnails(
              fullPath,
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

  private isPhotoFile(fileName: string): boolean {
    const ext = extname(fileName).toLowerCase();
    return this.photoExtensions.includes(ext);
  }

  private isThumbnailFile(fileName: string): boolean {
    return this.thumbnailPatterns.some((pattern) => fileName.includes(pattern));
  }

  private async quickHash(filePath: string, size: number): Promise<string> {
    // Use size + first/last 1KB for quick duplicate detection
    try {
      const hash = crypto.createHash("sha256");
      hash.update(size.toString());

      const buffer = Buffer.alloc(Math.min(1024, size));
      const fd = await fs.open(filePath, "r");

      try {
        await fd.read(buffer, 0, buffer.length, 0);
        hash.update(buffer);

        if (size > 2048) {
          await fd.read(buffer, 0, Math.min(1024, size - 1024), size - 1024);
          hash.update(buffer);
        }
      } finally {
        await fd.close();
      }

      return hash.digest("hex");
    } catch (error) {
      throw new Error(
        `Failed to hash file: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Cleaning ${items.length} photo junk items`, {
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
    const { QuarantineManager } = await import("../file-ops/quarantine");
    return await QuarantineManager.restoreFile(quarantineId);
  }
}
