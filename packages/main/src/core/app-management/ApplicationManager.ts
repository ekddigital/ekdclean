// EKD Clean - Application Manager
// Built by EKD Digital
// Handles application detection and closure prompts for effective cleaning

import { exec } from "child_process";
import { promisify } from "util";
import { Logger } from "../logger";

const execAsync = promisify(exec);

export interface ApplicationInfo {
  name: string;
  processId: number;
  bundleId?: string;
  path: string;
  usingFiles: string[];
  canForceQuit: boolean;
  isSystemCritical: boolean;
}

export interface ClosurePrompt {
  applications: ApplicationInfo[];
  affectedPaths: string[];
  estimatedSpaceToFree: number;
  message: string;
  canForceClose: boolean;
}

export class ApplicationManager {
  private static instance: ApplicationManager;

  public static getInstance(): ApplicationManager {
    if (!ApplicationManager.instance) {
      ApplicationManager.instance = new ApplicationManager();
    }
    return ApplicationManager.instance;
  }

  /**
   * Analyze which applications are preventing file deletion
   */
  async analyzeFileLocks(filePaths: string[]): Promise<ClosurePrompt | null> {
    Logger.info(
      "ApplicationManager",
      `🔍 Analyzing file locks for ${filePaths.length} paths`
    );

    const blockedByApps: ApplicationInfo[] = [];
    const estimatedSpace = await this.calculateTotalSize(filePaths);

    // Check each path for blocking processes
    for (const path of filePaths) {
      const apps = await this.getApplicationsUsingPath(path);

      for (const app of apps) {
        // Don't duplicate apps in the list
        const existing = blockedByApps.find(
          (a) => a.bundleId === app.bundleId || a.processId === app.processId
        );
        if (!existing) {
          blockedByApps.push(app);
        } else {
          // Add this path to the existing app's file list
          if (!existing.usingFiles.includes(path)) {
            existing.usingFiles.push(path);
          }
        }
      }
    }

    if (blockedByApps.length === 0) {
      return null; // No applications blocking
    }

    // Filter out system-critical applications that shouldn't be closed
    const closeableApps = blockedByApps.filter((app) => !app.isSystemCritical);

    if (closeableApps.length === 0) {
      Logger.warn(
        "ApplicationManager",
        "All blocking applications are system-critical"
      );
      return null;
    }

    const message = this.generateClosureMessage(closeableApps, estimatedSpace);

    return {
      applications: closeableApps,
      affectedPaths: filePaths.filter((path) =>
        closeableApps.some((app) => app.usingFiles.includes(path))
      ),
      estimatedSpaceToFree: estimatedSpace,
      message,
      canForceClose: closeableApps.every((app) => app.canForceQuit),
    };
  }

  /**
   * Get applications using a specific path
   */
  private async getApplicationsUsingPath(
    path: string
  ): Promise<ApplicationInfo[]> {
    const applications: ApplicationInfo[] = [];

    try {
      // Use lsof to find processes using the file/directory
      const { stdout } = await execAsync(
        `lsof +D "${path}" 2>/dev/null || true`
      );

      if (!stdout.trim()) {
        return applications;
      }

      const lines = stdout.split("\n").slice(1); // Skip header
      const processIds = new Set<number>();

      // Parse lsof output to get unique process IDs
      for (const line of lines) {
        if (!line.trim()) continue;

        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const pid = parseInt(parts[1]);
          if (!isNaN(pid)) {
            processIds.add(pid);
          }
        }
      }

      // Get application info for each process
      for (const pid of processIds) {
        const appInfo = await this.getApplicationInfoByPid(pid, path);
        if (appInfo) {
          applications.push(appInfo);
        }
      }
    } catch (error) {
      Logger.debug(
        "ApplicationManager",
        `Failed to check file locks for ${path}`,
        {
          error: error instanceof Error ? error.message : "Unknown",
        }
      );
    }

    return applications;
  }

  /**
   * Get application information by process ID
   */
  private async getApplicationInfoByPid(
    pid: number,
    usingPath: string
  ): Promise<ApplicationInfo | null> {
    try {
      // Get process information using ps
      const { stdout: psOut } = await execAsync(
        `ps -p ${pid} -o comm= -o args= 2>/dev/null || true`
      );

      if (!psOut.trim()) {
        return null; // Process no longer exists
      }

      const [command, ...args] = psOut.trim().split(/\s+/);
      const fullCommand = args.join(" ");

      // Try to get bundle identifier for macOS apps
      let bundleId: string | undefined;
      let appName = command;
      let appPath = command;

      try {
        // For macOS apps, try to get bundle info
        if (fullCommand.includes(".app/")) {
          const appMatch = fullCommand.match(/([^\/]+\.app)/);
          if (appMatch) {
            appName = appMatch[1].replace(".app", "");

            // Try to get bundle ID
            const { stdout: bundleOut } = await execAsync(
              `osascript -e 'id of app "${appName}"' 2>/dev/null || true`
            );

            if (bundleOut.trim()) {
              bundleId = bundleOut.trim();
            }
          }
        }
      } catch {
        // Ignore bundle lookup errors
      }

      // Determine if app can be safely closed
      const canForceQuit = !this.isSystemProcess(command, bundleId);
      const isSystemCritical = this.isSystemCritical(command, bundleId);

      return {
        name: appName,
        processId: pid,
        bundleId,
        path: appPath,
        usingFiles: [usingPath],
        canForceQuit,
        isSystemCritical,
      };
    } catch (error) {
      Logger.debug(
        "ApplicationManager",
        `Failed to get app info for PID ${pid}`,
        {
          error: error instanceof Error ? error.message : "Unknown",
        }
      );
      return null;
    }
  }

  /**
   * Check if a process is a system process that shouldn't be terminated
   */
  private isSystemProcess(command: string, bundleId?: string): boolean {
    const systemProcesses = [
      "kernel_task",
      "launchd",
      "kextd",
      "mds",
      "mdworker",
      "loginwindow",
      "WindowServer",
      "Dock",
      "Finder",
      "systemuiserver",
      "cfprefsd",
      "distnoted",
      "notifyd",
    ];

    const systemBundles = [
      "com.apple.finder",
      "com.apple.dock",
      "com.apple.loginwindow",
      "com.apple.windowserver",
      "com.apple.systemuiserver",
    ];

    return (
      systemProcesses.includes(command.toLowerCase()) ||
      Boolean(bundleId && systemBundles.includes(bundleId.toLowerCase()))
    );
  }

  /**
   * Check if an application is system-critical and shouldn't be closed
   */
  private isSystemCritical(command: string, bundleId?: string): boolean {
    const criticalApps = [
      "kernel_task",
      "launchd",
      "WindowServer",
      "loginwindow",
      "systemuiserver",
      "Dock",
      "Finder",
    ];

    const criticalBundles = [
      "com.apple.finder",
      "com.apple.dock",
      "com.apple.loginwindow",
      "com.apple.windowserver",
      "com.apple.systemuiserver",
    ];

    return (
      criticalApps.includes(command.toLowerCase()) ||
      Boolean(bundleId && criticalBundles.includes(bundleId.toLowerCase()))
    );
  }

  /**
   * Generate user-friendly closure message
   */
  private generateClosureMessage(
    apps: ApplicationInfo[],
    estimatedSpace: number
  ): string {
    const spaceMB = (estimatedSpace / 1024 / 1024).toFixed(1);
    const appNames = apps.map((app) => app.name).join(", ");

    if (apps.length === 1) {
      return `To free up ${spaceMB} MB, please close ${appNames}. The application is currently using files that need to be cleaned.`;
    } else {
      return `To free up ${spaceMB} MB, please close these applications: ${appNames}. They are currently using files that need to be cleaned.`;
    }
  }

  /**
   * Attempt to gracefully close applications
   */
  async closeApplications(
    apps: ApplicationInfo[],
    force: boolean = false
  ): Promise<{
    closed: ApplicationInfo[];
    failed: ApplicationInfo[];
  }> {
    Logger.info(
      "ApplicationManager",
      `🚪 Attempting to close ${apps.length} applications`,
      {
        force,
        apps: apps.map((app) => app.name),
      }
    );

    const closed: ApplicationInfo[] = [];
    const failed: ApplicationInfo[] = [];

    for (const app of apps) {
      try {
        let success = false;

        if (app.bundleId) {
          // Try AppleScript quit first for GUI apps
          try {
            await execAsync(`osascript -e 'tell app "${app.name}" to quit'`);
            success = true;
            Logger.info(
              "ApplicationManager",
              `✅ Gracefully closed: ${app.name}`
            );
          } catch (error) {
            Logger.debug(
              "ApplicationManager",
              `AppleScript quit failed for ${app.name}`
            );
          }
        }

        // If graceful quit failed and force is enabled
        if (!success && force && app.canForceQuit) {
          try {
            await execAsync(`kill -TERM ${app.processId}`);

            // Wait a moment then check if it's still running
            await new Promise((resolve) => setTimeout(resolve, 2000));

            try {
              await execAsync(`ps -p ${app.processId} >/dev/null 2>&1`);
              // Still running, try force kill
              await execAsync(`kill -KILL ${app.processId}`);
            } catch {
              // Process is gone, that's good
            }

            success = true;
            Logger.info("ApplicationManager", `🔥 Force closed: ${app.name}`);
          } catch (error) {
            Logger.warn(
              "ApplicationManager",
              `Failed to force close ${app.name}`,
              {
                error: error instanceof Error ? error.message : "Unknown",
              }
            );
          }
        }

        if (success) {
          closed.push(app);
        } else {
          failed.push(app);
        }
      } catch (error) {
        Logger.error("ApplicationManager", `Failed to close ${app.name}`, {
          error: error instanceof Error ? error.message : "Unknown",
        });
        failed.push(app);
      }
    }

    return { closed, failed };
  }

  /**
   * Check if applications are still running
   */
  async verifyApplicationsClosed(apps: ApplicationInfo[]): Promise<{
    stillRunning: ApplicationInfo[];
    closed: ApplicationInfo[];
  }> {
    const stillRunning: ApplicationInfo[] = [];
    const closed: ApplicationInfo[] = [];

    for (const app of apps) {
      try {
        await execAsync(`ps -p ${app.processId} >/dev/null 2>&1`);
        stillRunning.push(app);
      } catch {
        closed.push(app);
      }
    }

    return { stillRunning, closed };
  }

  /**
   * Calculate total size of file paths
   */
  private async calculateTotalSize(paths: string[]): Promise<number> {
    let totalSize = 0;
    let estimatedPaths = 0;

    for (const path of paths) {
      try {
        const { stdout } = await execAsync(
          `du -sb "${path}" 2>/dev/null || echo "0"`
        );
        const size = parseInt(stdout.split("\t")[0]);
        if (!isNaN(size) && size > 0) {
          totalSize += size;
        } else {
          // If we can't get size, estimate based on file type
          estimatedPaths++;
        }
      } catch {
        // Count paths we couldn't measure for estimation
        estimatedPaths++;
      }
    }

    // If we have paths we couldn't measure, provide a reasonable estimate
    // Average cache/temp file size is about 50MB per blocked path
    if (estimatedPaths > 0 && totalSize === 0) {
      totalSize = estimatedPaths * 50 * 1024 * 1024; // 50MB per estimated path
    }

    return totalSize;
  }

  /**
   * Get all running applications (for UI display)
   */
  async getRunningApplications(): Promise<ApplicationInfo[]> {
    const apps: ApplicationInfo[] = [];

    try {
      // Get all GUI applications using osascript
      const { stdout } = await execAsync(`
        osascript -e '
        set appList to {}
        tell application "System Events"
          set runningApps to (name of every application process whose background only is false)
          repeat with appName in runningApps
            set end of appList to appName as string
          end repeat
        end tell
        return appList
        ' 2>/dev/null || true
      `);

      const appNames = stdout.split(", ").map((name) => name.trim());

      for (const appName of appNames) {
        if (!appName) continue;

        try {
          const appInfo: ApplicationInfo = {
            name: appName,
            processId: 0, // We'll get this if needed
            path: "",
            usingFiles: [],
            canForceQuit: !this.isSystemProcess(appName),
            isSystemCritical: this.isSystemCritical(appName),
          };

          apps.push(appInfo);
        } catch {
          // Ignore individual app errors
        }
      }
    } catch (error) {
      Logger.debug("ApplicationManager", "Failed to get running applications", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    return apps;
  }
}
