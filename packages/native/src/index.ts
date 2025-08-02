// EKD Clean - Native Performance Engine
// Built by EKD Digital - Outperforming CleanMyMac's algorithms

import { promises as fs } from "fs";
import { platform, homedir, tmpdir } from "os";
import { join, basename, extname } from "path";
import glob from "fast-glob";

// 🚀 Platform-specific optimization algorithms
export class NativeOptimizer {
  private platform: string;
  private homeDir: string;
  private tempDir: string;

  constructor() {
    this.platform = platform();
    this.homeDir = homedir();
    this.tempDir = tmpdir();
  }

  // 🔍 Advanced Junk Detection Engine
  async scanForJunkFiles(): Promise<JunkFile[]> {
    const junkFiles: JunkFile[] = [];

    try {
      // Platform-specific scan patterns
      const scanTargets = this.getPlatformScanTargets();

      for (const target of scanTargets) {
        const files = await this.scanDirectory(target);
        junkFiles.push(...files);
      }

      // Sort by size (largest first) for maximum impact
      return junkFiles.sort((a, b) => b.size - a.size);
    } catch (error) {
      console.error("Scan error:", error);
      return [];
    }
  }

  // 🎯 Smart Directory Scanner
  private async scanDirectory(target: ScanTarget): Promise<JunkFile[]> {
    const files: JunkFile[] = [];

    try {
      const pattern = join(target.path, target.pattern);
      const foundFiles = await glob(pattern, {
        absolute: true,
        onlyFiles: true,
        ignore: target.ignore || [],
      });

      for (const filePath of foundFiles) {
        try {
          const stats = await fs.stat(filePath);
          const file: JunkFile = {
            path: filePath,
            size: stats.size,
            type: target.type,
            lastModified: stats.mtime,
            safe: this.isSafeToDelete(filePath, target.type),
          };

          // Only include files worth cleaning (>1KB)
          if (file.size > 1024) {
            files.push(file);
          }
        } catch (error) {
          // File might have been deleted or inaccessible
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scanning ${target.path}:`, error);
    }

    return files;
  }

  // 🛡️ Intelligent Safety Checker
  private isSafeToDelete(filePath: string, type: JunkType): boolean {
    const fileName = basename(filePath).toLowerCase();
    const fileExt = extname(filePath).toLowerCase();

    // Critical system files to never touch
    const criticalFiles = [
      ".ds_store",
      "thumbs.db",
      "desktop.ini",
      ".gitkeep",
      ".gitignore",
      "readme",
      "license",
    ];

    // Safe extensions by type
    const safeExtensions = {
      cache: [".cache", ".tmp", ".temp", ".log"],
      temp: [".tmp", ".temp", ".bak", ".old"],
      log: [".log", ".out", ".err"],
      download: [".part", ".crdownload", ".download"],
      trash: [".*"],
      duplicate: [".*"],
    };

    // Check if it's a critical file
    if (criticalFiles.some((critical) => fileName.includes(critical))) {
      return false;
    }

    // Check if extension is safe for this type
    const allowedExts = safeExtensions[type] || [];
    if (allowedExts.length > 0 && !allowedExts.includes(fileExt)) {
      return false;
    }

    // Additional safety checks
    return this.performAdvancedSafetyChecks(filePath, type);
  }

  // 🔬 Advanced Safety Analysis
  private performAdvancedSafetyChecks(
    filePath: string,
    type: JunkType
  ): boolean {
    // Check if file is currently in use
    if (this.isFileInUse(filePath)) {
      return false;
    }

    // Check if it's in a system directory
    if (this.isSystemDirectory(filePath)) {
      return type === "cache" || type === "temp"; // Only safe types in system dirs
    }

    // Check file age - newer files might be important
    const daysSinceModified = this.getDaysSinceModified(filePath);
    if (daysSinceModified < 1 && type !== "temp") {
      return false; // Don't delete recent non-temp files
    }

    return true;
  }

  // 💨 Lightning-Fast Bulk Cleaner
  async cleanFiles(filePaths: string[]): Promise<CleanResult> {
    const startTime = Date.now();
    let filesRemoved = 0;
    let spaceFreed = 0;
    const errors: string[] = [];

    // Process files in batches for better performance
    const batchSize = 50;
    const batches = this.chunkArray(filePaths, batchSize);

    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (filePath) => {
          try {
            const stats = await fs.stat(filePath);
            await fs.unlink(filePath);
            filesRemoved++;
            spaceFreed += stats.size;
          } catch (error) {
            errors.push(`Failed to delete ${filePath}: ${error}`);
          }
        })
      );
    }

    const duration = Date.now() - startTime;

    return {
      filesRemoved,
      spaceFreed,
      errors,
      duration,
    };
  }

  // 🏗️ Platform-Specific Scan Targets
  private getPlatformScanTargets(): ScanTarget[] {
    const baseTargets: ScanTarget[] = [
      // Universal temp files
      {
        path: this.tempDir,
        pattern: "**/*",
        type: "temp",
        ignore: ["**/.*", "**/*.lock"],
      },
    ];

    switch (this.platform) {
      case "darwin": // macOS
        return [
          ...baseTargets,
          // Browser caches
          {
            path: join(this.homeDir, "Library/Caches"),
            pattern: "**/Cache/**/*",
            type: "cache",
          },
          {
            path: join(this.homeDir, "Library/Caches"),
            pattern: "**/com.apple.Safari/Cache/**/*",
            type: "cache",
          },
          {
            path: join(this.homeDir, "Library/Caches"),
            pattern: "**/Google/Chrome/**/*",
            type: "cache",
          },
          // System logs
          {
            path: join(this.homeDir, "Library/Logs"),
            pattern: "**/*.log",
            type: "log",
          },
          // Downloads folder partials
          {
            path: join(this.homeDir, "Downloads"),
            pattern: "**/*.{part,crdownload,download}",
            type: "download",
          },
          // Trash
          {
            path: join(this.homeDir, ".Trash"),
            pattern: "**/*",
            type: "trash",
          },
        ];

      case "win32": // Windows
        return [
          ...baseTargets,
          // Windows temp
          {
            path: "C:\\Windows\\Temp",
            pattern: "**/*",
            type: "temp",
          },
          // Browser caches
          {
            path: join(
              this.homeDir,
              "AppData/Local/Google/Chrome/User Data/Default/Cache"
            ),
            pattern: "**/*",
            type: "cache",
          },
          {
            path: join(
              this.homeDir,
              "AppData/Local/Microsoft/Edge/User Data/Default/Cache"
            ),
            pattern: "**/*",
            type: "cache",
          },
          // Recycle bin
          {
            path: "C:\\$Recycle.Bin",
            pattern: "**/*",
            type: "trash",
          },
        ];

      case "linux": // Linux
        return [
          ...baseTargets,
          // Browser caches
          {
            path: join(this.homeDir, ".cache"),
            pattern: "**/*",
            type: "cache",
          },
          // System logs
          {
            path: "/var/log",
            pattern: "**/*.log",
            type: "log",
          },
          // Trash
          {
            path: join(this.homeDir, ".local/share/Trash"),
            pattern: "**/*",
            type: "trash",
          },
        ];

      default:
        return baseTargets;
    }
  }

  // 🛠️ Utility Methods
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private isFileInUse(filePath: string): boolean {
    try {
      // Try to get exclusive access to the file
      const fd = require("fs").openSync(filePath, "r+");
      require("fs").closeSync(fd);
      return false;
    } catch {
      return true; // File is in use or inaccessible
    }
  }

  private isSystemDirectory(filePath: string): boolean {
    const systemPaths = [
      "/System/",
      "/usr/",
      "/bin/",
      "/sbin/",
      "C:\\Windows\\",
      "C:\\Program Files\\",
      "C:\\Program Files (x86)\\",
    ];

    return systemPaths.some((sysPath) => filePath.startsWith(sysPath));
  }

  private getDaysSinceModified(filePath: string): number {
    try {
      const stats = require("fs").statSync(filePath);
      const now = new Date();
      const modified = new Date(stats.mtime);
      return Math.floor(
        (now.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24)
      );
    } catch {
      return 0;
    }
  }
}

// 📊 System Performance Monitor
export class SystemMonitor {
  // 🔥 Real-time Performance Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const { totalmem, freemem, cpus, loadavg } = require("os");

    return {
      memory: {
        total: totalmem(),
        free: freemem(),
        used: totalmem() - freemem(),
        percentage: Math.round(((totalmem() - freemem()) / totalmem()) * 100),
      },
      cpu: {
        count: cpus().length,
        load: loadavg(),
        usage: await this.getCpuUsage(),
      },
      disk: await this.getDiskSpace(),
    };
  }

  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = process.cpuUsage();
      setTimeout(() => {
        const endMeasure = process.cpuUsage(startMeasure);
        const totalUsage = endMeasure.user + endMeasure.system;
        const percentage = Math.round((totalUsage / 1000000) * 100); // Convert to percentage
        resolve(Math.min(percentage, 100));
      }, 100);
    });
  }

  private async getDiskSpace(): Promise<DiskSpace> {
    try {
      const { spawnSync } = require("child_process");
      let command: string;
      let args: string[];

      if (process.platform === "win32") {
        command = "wmic";
        args = ["logicaldisk", "get", "size,freespace,caption"];
      } else {
        command = "df";
        args = ["-h", "/"];
      }

      const result = spawnSync(command, args, { encoding: "utf8" });

      if (result.status === 0) {
        return this.parseDiskOutput(result.stdout);
      }
    } catch (error) {
      console.error("Error getting disk space:", error);
    }

    // Fallback values
    return {
      total: 0,
      free: 0,
      used: 0,
      percentage: 0,
    };
  }

  private parseDiskOutput(output: string): DiskSpace {
    // This is a simplified parser - in production, you'd want more robust parsing
    const lines = output.split("\n").filter((line) => line.trim());

    if (process.platform === "win32") {
      // Parse Windows wmic output
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3 && !isNaN(Number(parts[1]))) {
          const free = Number(parts[1]);
          const total = Number(parts[2]);
          const used = total - free;
          return {
            total,
            free,
            used,
            percentage: Math.round((used / total) * 100),
          };
        }
      }
    } else {
      // Parse Unix df output
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        if (parts.length >= 4) {
          const total = this.parseSize(parts[1]);
          const used = this.parseSize(parts[2]);
          const free = this.parseSize(parts[3]);
          return {
            total,
            free,
            used,
            percentage: Math.round((used / total) * 100),
          };
        }
      }
    }

    return { total: 0, free: 0, used: 0, percentage: 0 };
  }

  private parseSize(sizeStr: string): number {
    // Convert human-readable sizes to bytes
    const units = { K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT])?$/i);

    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2]?.toUpperCase() as keyof typeof units;
      return Math.round(value * (units[unit] || 1));
    }

    return parseInt(sizeStr) || 0;
  }
}

// 🏆 Advanced Duplicate Finder
export class DuplicateFinder {
  private hashCache = new Map<string, string>();

  async findDuplicates(directories: string[]): Promise<DuplicateGroup[]> {
    const fileMap = new Map<string, FileInfo[]>();

    // Scan all directories
    for (const dir of directories) {
      await this.scanForFiles(dir, fileMap);
    }

    // Find duplicates by hash
    const duplicateGroups: DuplicateGroup[] = [];

    for (const [hash, files] of fileMap.entries()) {
      if (files.length > 1) {
        duplicateGroups.push({
          hash,
          files,
          totalSize: files.reduce((sum, file) => sum + file.size, 0),
          count: files.length,
        });
      }
    }

    // Sort by potential space savings
    return duplicateGroups.sort((a, b) => b.totalSize - a.totalSize);
  }

  private async scanForFiles(
    directory: string,
    fileMap: Map<string, FileInfo[]>
  ): Promise<void> {
    try {
      const files = await glob("**/*", {
        cwd: directory,
        absolute: true,
        onlyFiles: true,
        ignore: ["**/.*", "**/node_modules/**"],
      });

      for (const filePath of files) {
        try {
          const stats = await fs.stat(filePath);

          // Skip small files (< 1MB) to focus on meaningful duplicates
          if (stats.size < 1024 * 1024) continue;

          const hash = await this.getFileHash(filePath);
          const fileInfo: FileInfo = {
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime,
          };

          if (!fileMap.has(hash)) {
            fileMap.set(hash, []);
          }
          fileMap.get(hash)!.push(fileInfo);
        } catch (error) {
          // Skip inaccessible files
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${directory}:`, error);
    }
  }

  private async getFileHash(filePath: string): Promise<string> {
    if (this.hashCache.has(filePath)) {
      return this.hashCache.get(filePath)!;
    }

    try {
      const crypto = require("crypto");
      const data = await fs.readFile(filePath);
      const hash = crypto.createHash("sha256").update(data).digest("hex");
      this.hashCache.set(filePath, hash);
      return hash;
    } catch (error) {
      // Fallback to a simple hash based on file stats
      const stats = await fs.stat(filePath);
      const simpleHash = `${stats.size}_${stats.mtime.getTime()}`;
      this.hashCache.set(filePath, simpleHash);
      return simpleHash;
    }
  }
}

// 📱 Type Definitions
export interface JunkFile {
  path: string;
  size: number;
  type: JunkType;
  lastModified: Date;
  safe: boolean;
}

export type JunkType =
  | "cache"
  | "temp"
  | "log"
  | "download"
  | "trash"
  | "duplicate";

export interface CleanResult {
  filesRemoved: number;
  spaceFreed: number;
  errors: string[];
  duration: number;
}

export interface ScanTarget {
  path: string;
  pattern: string;
  type: JunkType;
  ignore?: string[];
}

export interface SystemMetrics {
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  cpu: {
    count: number;
    load: number[];
    usage: number;
  };
  disk: DiskSpace;
}

export interface DiskSpace {
  total: number;
  free: number;
  used: number;
  percentage: number;
}

export interface FileInfo {
  path: string;
  size: number;
  lastModified: Date;
}

export interface DuplicateGroup {
  hash: string;
  files: FileInfo[];
  totalSize: number;
  count: number;
}

// 🎯 Main Export
export const EKDNative = {
  NativeOptimizer,
  SystemMonitor,
  DuplicateFinder,
};
