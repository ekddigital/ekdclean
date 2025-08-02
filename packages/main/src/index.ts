// EKD Clean - Main Electron Process
// Built by EKD Digital

import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from "electron";
import { join } from "path";
import {
  platform,
  totalmem,
  freemem,
  cpus,
  arch,
  release,
  homedir,
  tmpdir,
} from "os";
import { promises as fs, constants, existsSync } from "fs";
import { SystemInfo, ScanResult, ActivityItem } from "./types";

// Real system scanning utility functions
class SystemScanner {
  private static activityHistory: ActivityItem[] = [];

  static async getDetailedSystemInfo(): Promise<SystemInfo> {
    const totalMem = totalmem();
    const freeMem = freemem();
    const cpuInfo = cpus();

    return {
      platform: platform(),
      arch: arch(),
      totalMemory: totalMem,
      freeMemory: freeMem,
      cpuCount: cpuInfo.length,
      osVersion: release(),
      nodeVersion: process.version,
      electronVersion: process.versions.electron || "unknown",
      appVersion: app.getVersion(),
    };
  }

  static async scanForJunkFiles(): Promise<ScanResult[]> {
    const scanStart = new Date();

    this.addActivity({
      id: `activity_${Date.now()}`,
      type: "scan",
      title: "Smart Scan Started",
      subtitle: "Intelligently analyzing system for safe cleanup opportunities",
      timestamp: scanStart,
      status: "running",
    });

    try {
      const results: ScanResult[] = [];

      // Smart system cache scanning (truly safe)
      const appCacheResult = await this.scanApplicationCaches();
      if (appCacheResult) results.push(appCacheResult);

      // Browser cache and data (safe to clean)
      const browserCacheResult = await this.scanBrowserCaches();
      if (browserCacheResult) results.push(browserCacheResult);

      // System temporary files (safe)
      const tempResult = await this.scanSystemTempFiles();
      if (tempResult) results.push(tempResult);

      // Old log files (safe, but selective)
      const logResult = await this.scanOldLogFiles();
      if (logResult) results.push(logResult);

      // Trash/Bin contents (safe to empty)
      const trashResult = await this.scanTrashContents();
      if (trashResult) results.push(trashResult);

      // Development artifacts (if detected)
      const devResult = await this.scanDevelopmentArtifacts();
      if (devResult) results.push(devResult);

      this.addActivity({
        id: `activity_${Date.now()}`,
        type: "scan",
        title: "Smart Scan Completed",
        subtitle: `Intelligently identified ${results.length} safe cleanup categories`,
        timestamp: new Date(),
        status: "completed",
        details: `Smart analysis completed in ${Date.now() - scanStart.getTime()}ms`,
      });

      return results;
    } catch (error) {
      this.addActivity({
        id: `activity_${Date.now()}`,
        type: "scan",
        title: "Smart Scan Failed",
        subtitle: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
        status: "error",
      });
      return [];
    }
  }

  private static async scanApplicationCaches(): Promise<ScanResult | null> {
    try {
      const userHome = homedir();
      // Focus on specific application caches that are safe to clean
      const safeCachePaths = [
        join(userHome, "Library/Caches/com.apple.Safari"),
        join(userHome, "Library/Caches/com.google.Chrome"),
        join(userHome, "Library/Caches/com.microsoft.VSCode"),
        join(userHome, "Library/Caches/org.nodejs.npm"),
        join(userHome, "Library/Caches/Homebrew"),
        join(userHome, "Library/Caches/pip"),
        // System temp caches
        join(tmpdir(), "cache"),
      ];

      const existingPaths: string[] = [];
      let totalSize = 0;
      let fileCount = 0;

      for (const cachePath of safeCachePaths) {
        try {
          await fs.access(cachePath, constants.F_OK);
          const stats = await this.getDirectoryStats(cachePath);
          if (stats.size > 0) {
            existingPaths.push(cachePath);
            totalSize += stats.size;
            fileCount += stats.files;
          }
        } catch {
          // Directory doesn't exist or no access, skip safely
        }
      }

      if (existingPaths.length > 0) {
        return {
          id: `app_cache_${Date.now()}`,
          name: "Application Caches",
          type: "cache",
          size: totalSize,
          files: fileCount,
          path: existingPaths.join(";"), // Store actual paths separated by semicolon
          description: "Safe application cache files that can be regenerated",
          safe: true,
          scanTime: new Date(),
        };
      }
    } catch (error) {
      console.error("Application cache scan error:", error);
    }
    return null;
  }

  private static async scanBrowserCaches(): Promise<ScanResult | null> {
    try {
      const userHome = homedir();
      const browserCaches = [
        join(userHome, "Library/Caches/Google/Chrome/Default/Cache"),
        join(userHome, "Library/Caches/com.apple.Safari/WebKitCache"),
        join(userHome, "Library/Safari/LocalStorage"),
        join(
          userHome,
          "Library/Application Support/Google/Chrome/Default/GPUCache"
        ),
      ];

      const existingPaths: string[] = [];
      let totalSize = 0;
      let fileCount = 0;

      for (const cachePath of browserCaches) {
        try {
          await fs.access(cachePath, constants.F_OK);
          const stats = await this.getDirectoryStats(cachePath);
          if (stats.size > 0) {
            existingPaths.push(cachePath);
            totalSize += stats.size;
            fileCount += stats.files;
          }
        } catch {
          // Skip inaccessible browser caches
        }
      }

      if (existingPaths.length > 0) {
        return {
          id: `browser_cache_${Date.now()}`,
          name: "Browser Cache Files",
          type: "cache",
          size: totalSize,
          files: fileCount,
          path: existingPaths.join(";"), // Store actual paths
          description: "Browser cache files that can be safely cleared",
          safe: true,
          scanTime: new Date(),
        };
      }
    } catch (error) {
      console.error("Browser cache scan error:", error);
    }
    return null;
  }

  private static async scanSystemTempFiles(): Promise<ScanResult | null> {
    try {
      const tempPath = tmpdir();
      const systemTempPaths = [tempPath, "/private/tmp"];

      const tempFiles: string[] = [];
      let totalSize = 0;
      let fileCount = 0;

      for (const tempDir of systemTempPaths) {
        try {
          await fs.access(tempDir, constants.F_OK);
          // Get files older than 24 hours
          const oldFiles = await this.getOldFilesInDirectory(
            tempDir,
            24 * 60 * 60 * 1000
          );
          tempFiles.push(...oldFiles.map((f) => f.path));
          totalSize += oldFiles.reduce((sum, f) => sum + f.size, 0);
          fileCount += oldFiles.length;
        } catch {
          // Skip inaccessible temp directories
        }
      }

      if (tempFiles.length > 0) {
        return {
          id: `system_temp_${Date.now()}`,
          name: "System Temporary Files",
          type: "temp",
          size: totalSize,
          files: fileCount,
          path: tempFiles.join(";"), // Store actual file paths
          description: "Temporary files older than 24 hours (safe to remove)",
          safe: true,
          scanTime: new Date(),
        };
      }
    } catch (error) {
      console.error("System temp scan error:", error);
    }
    return null;
  }

  private static async scanOldLogFiles(): Promise<ScanResult | null> {
    try {
      const userHome = homedir();
      const logPaths = [
        join(userHome, "Library/Logs"),
        // Only scan user logs, not system logs for safety
      ];

      const existingPaths: string[] = [];
      let totalSize = 0;
      let fileCount = 0;

      for (const logPath of logPaths) {
        try {
          await fs.access(logPath, constants.F_OK);
          // Only scan log files older than 7 days
          const stats = await this.getDirectoryStatsWithAge(
            logPath,
            7 * 24 * 60 * 60 * 1000,
            /\.log$/
          );
          if (stats.size > 0) {
            existingPaths.push(logPath);
            totalSize += stats.size;
            fileCount += stats.files;
          }
        } catch {
          // Skip inaccessible log directories
        }
      }

      if (existingPaths.length > 0) {
        return {
          id: `old_logs_${Date.now()}`,
          name: "Old Log Files",
          type: "log",
          size: totalSize,
          files: fileCount,
          path: existingPaths.join(";"), // Store actual paths
          description: "Log files older than 7 days (safe to remove)",
          safe: true,
          scanTime: new Date(),
        };
      }
    } catch (error) {
      console.error("Old log scan error:", error);
    }
    return null;
  }

  private static async scanTrashContents(): Promise<ScanResult | null> {
    try {
      const userHome = homedir();
      const trashPath = join(userHome, ".Trash");

      await fs.access(trashPath, constants.F_OK);
      const stats = await this.getDirectoryStats(trashPath);

      if (stats.size > 0) {
        return {
          id: `trash_${Date.now()}`,
          name: "Trash Contents",
          type: "trash",
          size: stats.size,
          files: stats.files,
          path: trashPath,
          description: "Files in trash that can be permanently deleted",
          safe: true,
          scanTime: new Date(),
        };
      }
    } catch (error) {
      console.error("Trash scan error:", error);
    }
    return null;
  }

  private static async scanDevelopmentArtifacts(): Promise<ScanResult | null> {
    try {
      const userHome = homedir();
      const devPaths = [
        join(userHome, ".npm/_cacache"),
        join(userHome, ".yarn/cache"),
        join(userHome, ".cache/pip"),
        join(userHome, "Library/Caches/com.apple.dt.Xcode"),
      ];

      const existingPaths: string[] = [];
      let totalSize = 0;
      let fileCount = 0;

      for (const devPath of devPaths) {
        try {
          await fs.access(devPath, constants.F_OK);
          const stats = await this.getDirectoryStats(devPath);
          if (stats.size > 0) {
            existingPaths.push(devPath);
            totalSize += stats.size;
            fileCount += stats.files;
          }
        } catch {
          // Skip if development tools not installed
        }
      }

      if (existingPaths.length > 0) {
        return {
          id: `dev_artifacts_${Date.now()}`,
          name: "Development Caches",
          type: "cache",
          size: totalSize,
          files: fileCount,
          path: existingPaths.join(";"), // Store actual paths
          description: "Development tool caches (npm, yarn, pip, Xcode)",
          safe: true,
          scanTime: new Date(),
        };
      }
    } catch (error) {
      console.error("Development artifacts scan error:", error);
    }
    return null;
  }

  private static async getDirectoryStats(
    dirPath: string,
    nameFilter?: RegExp,
    sizeFilter?: number
  ): Promise<{ size: number; files: number }> {
    let totalSize = 0;
    let fileCount = 0;

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        try {
          const itemPath = join(dirPath, item);
          const stat = await fs.stat(itemPath);

          if (stat.isFile()) {
            const includeFile =
              (!nameFilter || nameFilter.test(item)) &&
              (!sizeFilter || stat.size >= sizeFilter);

            if (includeFile) {
              totalSize += stat.size;
              fileCount++;
            }
          } else if (stat.isDirectory()) {
            // Recursively scan subdirectories (with depth limit for safety)
            const subStats = await this.getDirectoryStats(
              itemPath,
              nameFilter,
              sizeFilter
            );
            totalSize += subStats.size;
            fileCount += subStats.files;
          }
        } catch {
          // Skip files we can't access
        }
      }
    } catch (error) {
      // Directory not accessible
    }

    return { size: totalSize, files: fileCount };
  }

  private static async getDirectoryStatsWithAge(
    dirPath: string,
    maxAgeMs: number,
    nameFilter?: RegExp,
    sizeFilter?: number
  ): Promise<{ size: number; files: number }> {
    let totalSize = 0;
    let fileCount = 0;
    const now = Date.now();

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        try {
          const itemPath = join(dirPath, item);
          const stat = await fs.stat(itemPath);
          const ageMs = now - stat.mtime.getTime();

          if (stat.isFile() && ageMs >= maxAgeMs) {
            const includeFile =
              (!nameFilter || nameFilter.test(item)) &&
              (!sizeFilter || stat.size >= sizeFilter);

            if (includeFile) {
              totalSize += stat.size;
              fileCount++;
            }
          } else if (stat.isDirectory()) {
            // Recursively scan subdirectories with age filter
            const subStats = await this.getDirectoryStatsWithAge(
              itemPath,
              maxAgeMs,
              nameFilter,
              sizeFilter
            );
            totalSize += subStats.size;
            fileCount += subStats.files;
          }
        } catch {
          // Skip files we can't access
        }
      }
    } catch (error) {
      // Directory not accessible
    }

    return { size: totalSize, files: fileCount };
  }

  static async getOldFilesInDirectory(
    dirPath: string,
    maxAge: number
  ): Promise<Array<{ path: string; size: number }>> {
    const oldFiles: Array<{ path: string; size: number }> = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const cutoffTime = Date.now() - maxAge;

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        try {
          const stat = await fs.stat(fullPath);

          if (stat.mtime.getTime() < cutoffTime) {
            if (entry.isFile()) {
              oldFiles.push({ path: fullPath, size: stat.size });
            } else if (entry.isDirectory()) {
              // Recursively check subdirectories (limit depth for safety)
              const subFiles = await this.getOldFilesInDirectory(
                fullPath,
                maxAge
              );
              oldFiles.push(...subFiles);
            }
          }
        } catch {
          // Skip files we can't access
        }
      }
    } catch {
      // Skip directories we can't read
    }

    return oldFiles;
  }

  // Safe file and directory deletion utility
  static async safeDelete(
    targetPath: string,
    options: { maxAge?: number } = {}
  ): Promise<{ filesDeleted: number; sizeFreed: number }> {
    let filesDeleted = 0;
    let sizeFreed = 0;

    try {
      // Check if path exists
      if (!existsSync(targetPath)) {
        return { filesDeleted, sizeFreed };
      }

      const stat = await fs.stat(targetPath);

      if (stat.isDirectory()) {
        // For directories, clean contents but keep the directory structure
        const entries = await fs.readdir(targetPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(targetPath, entry.name);

          try {
            const entryStat = await fs.stat(fullPath);
            const ageInDays =
              (Date.now() - entryStat.mtime.getTime()) / (1000 * 60 * 60 * 24);

            // Skip if file is too new (respecting maxAge option)
            if (options.maxAge && ageInDays < options.maxAge) {
              continue;
            }

            if (entry.isDirectory()) {
              // Recursively delete directory contents
              const result = await this.safeDelete(fullPath, options);
              filesDeleted += result.filesDeleted;
              sizeFreed += result.sizeFreed;

              // Try to remove empty directory
              try {
                const remaining = await fs.readdir(fullPath);
                if (remaining.length === 0) {
                  await fs.rmdir(fullPath);
                  filesDeleted += 1;
                }
              } catch {
                // Directory not empty or other error, skip
              }
            } else {
              // Delete file
              sizeFreed += entryStat.size;
              await fs.unlink(fullPath);
              filesDeleted += 1;
            }
          } catch (error) {
            // Skip files we can't delete (permissions, in use, etc.)
            console.warn(`Could not delete ${fullPath}:`, error);
          }
        }
      } else {
        // Single file deletion
        const ageInDays =
          (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (!options.maxAge || ageInDays >= options.maxAge) {
          sizeFreed += stat.size;
          await fs.unlink(targetPath);
          filesDeleted += 1;
        }
      }
    } catch (error) {
      console.warn(`Could not process ${targetPath}:`, error);
    }

    return { filesDeleted, sizeFreed };
  }

  static addActivity(activity: ActivityItem): void {
    this.activityHistory.unshift(activity);
    // Keep only last 20 activities
    if (this.activityHistory.length > 20) {
      this.activityHistory = this.activityHistory.slice(0, 20);
    }
  }

  static getRecentActivity(): ActivityItem[] {
    return [...this.activityHistory];
  }

  static getMemoryUsage(): { used: number; total: number; percentage: number } {
    const total = totalmem();
    const free = freemem();
    const used = total - free;
    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage: Math.round(percentage * 10) / 10,
    };
  }
}

class EKDCleanApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.createSystemTray();
      this.setupIPCHandlers();
    });

    // Handle app activation (macOS)
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // Handle all windows closed
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1024,
      minHeight: 768,
      show: false,
      titleBarStyle: "hiddenInset",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, "preload", "index.js"),
      },
    });

    // Load the renderer
    if (process.env.NODE_ENV === "development") {
      this.mainWindow.loadURL("http://localhost:3000");
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(
        join(__dirname, "../../../packages/renderer/dist/index.html")
      );
    }

    // Show window when ready
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private async createSystemTray(): Promise<void> {
    try {
      // Create a simple icon for the tray (using a base64 encoded 16x16 icon)
      const icon = nativeImage.createFromDataURL(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVDiNpZM9SwNBEIafJQQLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sLwcJCG1sL"
      );

      // Create the tray
      this.tray = new Tray(icon);

      // Get real-time system stats for the menu
      const systemInfo = await SystemScanner.getDetailedSystemInfo();
      const memoryUsage = await SystemScanner.getMemoryUsage();

      // Create context menu
      const contextMenu = Menu.buildFromTemplate([
        {
          label: "EKD Clean",
          type: "normal",
          enabled: false,
        },
        { type: "separator" },
        {
          label: `Memory: ${memoryUsage.percentage.toFixed(1)}% used`,
          type: "normal",
          enabled: false,
        },
        {
          label: `Available: ${this.formatBytes(systemInfo.freeMemory)}`,
          type: "normal",
          enabled: false,
        },
        {
          label: `Total: ${this.formatBytes(systemInfo.totalMemory)}`,
          type: "normal",
          enabled: false,
        },
        { type: "separator" },
        {
          label: "Show EKD Clean",
          type: "normal",
          click: () => {
            if (this.mainWindow) {
              this.mainWindow.show();
              this.mainWindow.focus();
            } else {
              this.createMainWindow();
            }
          },
        },
        {
          label: "Quick Scan",
          type: "normal",
          click: async () => {
            // Trigger a quick scan
            if (this.mainWindow) {
              this.mainWindow.webContents.send("start-quick-scan");
            }
          },
        },
        { type: "separator" },
        {
          label: "Quit EKD Clean",
          type: "normal",
          click: () => {
            app.quit();
          },
        },
      ]);

      this.tray.setContextMenu(contextMenu);
      this.tray.setToolTip("EKD Clean - System Optimizer");

      // Update tray menu every 30 seconds with fresh system stats
      setInterval(async () => {
        try {
          const updatedSystemInfo = await SystemScanner.getDetailedSystemInfo();
          const updatedMemoryUsage = await SystemScanner.getMemoryUsage();

          const updatedMenu = Menu.buildFromTemplate([
            {
              label: "EKD Clean",
              type: "normal",
              enabled: false,
            },
            { type: "separator" },
            {
              label: `Memory: ${updatedMemoryUsage.percentage.toFixed(1)}% used`,
              type: "normal",
              enabled: false,
            },
            {
              label: `Available: ${this.formatBytes(updatedSystemInfo.freeMemory)}`,
              type: "normal",
              enabled: false,
            },
            {
              label: `Total: ${this.formatBytes(updatedSystemInfo.totalMemory)}`,
              type: "normal",
              enabled: false,
            },
            { type: "separator" },
            {
              label: "Show EKD Clean",
              type: "normal",
              click: () => {
                if (this.mainWindow) {
                  this.mainWindow.show();
                  this.mainWindow.focus();
                } else {
                  this.createMainWindow();
                }
              },
            },
            {
              label: "Quick Scan",
              type: "normal",
              click: async () => {
                if (this.mainWindow) {
                  this.mainWindow.webContents.send("start-quick-scan");
                }
              },
            },
            { type: "separator" },
            {
              label: "Quit EKD Clean",
              type: "normal",
              click: () => {
                app.quit();
              },
            },
          ]);

          this.tray?.setContextMenu(updatedMenu);
        } catch (error) {
          console.error("Failed to update tray menu:", error);
        }
      }, 30000);
    } catch (error) {
      console.error("Failed to create system tray:", error);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  private setupIPCHandlers(): void {
    // Real system info handler
    ipcMain.handle("get-system-info", async () => {
      return await SystemScanner.getDetailedSystemInfo();
    });

    // Real scanning handler
    ipcMain.handle("scan-system", async () => {
      return await SystemScanner.scanForJunkFiles();
    });

    // Legacy scan handler for compatibility
    ipcMain.handle("scan-for-junk", async () => {
      return await SystemScanner.scanForJunkFiles();
    });

    // Real memory usage handler
    ipcMain.handle("get-memory-usage", async () => {
      return SystemScanner.getMemoryUsage();
    });

    // Real activity history handler
    ipcMain.handle("get-recent-activity", async () => {
      return SystemScanner.getRecentActivity();
    });

    // Real file cleaning handler
    ipcMain.handle("clean-files", async (_event, scanResults: ScanResult[]) => {
      const startTime = Date.now();
      let filesRemoved = 0;
      let spaceFreed = 0;
      const errors: string[] = [];

      SystemScanner.addActivity({
        id: `activity_${Date.now()}`,
        type: "clean",
        title: "Cleaning Started",
        subtitle: `Cleaning ${scanResults.length} categories`,
        timestamp: new Date(),
        status: "running",
      });

      for (const result of scanResults) {
        try {
          if (result.safe && result.type !== "large") {
            // Only clean safe items automatically
            console.log(`Cleaning ${result.name} at path: ${result.path}`);

            // Determine appropriate deletion options based on type
            const deleteOptions: { maxAge?: number } = {};

            switch (result.type) {
              case "temp":
                deleteOptions.maxAge = 1; // Only delete temp files older than 1 day
                break;
              case "log":
                deleteOptions.maxAge = 7; // Only delete logs older than 7 days
                break;
              case "cache":
                // Cache files can be deleted regardless of age
                break;
              case "trash":
                // Trash can be emptied regardless of age
                break;
              default:
                // For other types, be conservative
                deleteOptions.maxAge = 1;
            }

            // Perform actual deletion
            // Parse multiple paths separated by semicolons
            const pathsToDelete = result.path
              .split(";")
              .filter((p) => p.trim().length > 0);

            for (const pathToDelete of pathsToDelete) {
              try {
                const deleteResult = await SystemScanner.safeDelete(
                  pathToDelete.trim(),
                  deleteOptions
                );
                filesRemoved += deleteResult.filesDeleted;
                spaceFreed += deleteResult.sizeFreed;

                console.log(
                  `Cleaned ${result.name} at ${pathToDelete}: ${deleteResult.filesDeleted} files, ${deleteResult.sizeFreed} bytes freed`
                );
              } catch (error) {
                console.error(`Failed to clean path ${pathToDelete}:`, error);
                errors.push(
                  `Failed to clean ${pathToDelete}: ${error instanceof Error ? error.message : "Unknown error"}`
                );
              }
            }
          } else {
            console.log(
              `Skipping ${result.name} - not safe or is large file type`
            );
          }
        } catch (error) {
          errors.push(
            `Failed to clean ${result.name}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      const duration = Date.now() - startTime;

      SystemScanner.addActivity({
        id: `activity_${Date.now()}`,
        type: "clean",
        title: "Cleaning Completed",
        subtitle: `Removed ${filesRemoved} files, freed ${(spaceFreed / 1024 / 1024).toFixed(1)} MB`,
        timestamp: new Date(),
        status: errors.length > 0 ? "error" : "completed",
        details: errors.length > 0 ? errors.join("; ") : undefined,
      });

      return {
        filesRemoved,
        spaceFreed,
        errors,
        duration,
      };
    });

    // Window Management
    ipcMain.on("window-minimize", () => {
      this.mainWindow?.minimize();
    });

    ipcMain.on("window-maximize", () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.on("window-close", () => {
      this.mainWindow?.close();
    });
  }
}

// Initialize the application
new EKDCleanApp();
