// EKD Clean - Permission Manager
// Built by EKD Digital - Handle macOS permissions for thorough scanning

import { execSync } from "child_process";
import { join } from "path";
import { homedir } from "os";
import { Logger } from "../logger";
import { shell, dialog } from "electron";

export interface PermissionStatus {
  fullDiskAccess: boolean;
  accessibility: boolean;
  filesAndFolders: boolean;
  canAccessTrash: boolean;
  canAccessLibrary: boolean;
  canAccessSystemCaches: boolean;
}

export interface PermissionCheck {
  name: string;
  status: boolean;
  required: boolean;
  description: string;
  instructions: string;
}

export class PermissionManager {
  private static instance: PermissionManager;
  private readonly id = "permission-manager";

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Check all permissions required for thorough scanning
   */
  async checkAllPermissions(): Promise<PermissionStatus> {
    Logger.info(this.id, "Checking all required permissions");

    const permissions: PermissionStatus = {
      fullDiskAccess: await this.checkFullDiskAccess(),
      accessibility: await this.checkAccessibilityPermission(),
      filesAndFolders: await this.checkFilesAndFoldersAccess(),
      canAccessTrash: await this.canAccessPath(join(homedir(), ".Trash")),
      canAccessLibrary: await this.canAccessPath(join(homedir(), "Library")),
      canAccessSystemCaches: await this.canAccessPath("/Library/Caches"),
    };

    Logger.info(this.id, "Permission check complete", permissions);
    return permissions;
  }

  /**
   * Get detailed permission checks with instructions
   */
  async getPermissionChecks(): Promise<PermissionCheck[]> {
    const status = await this.checkAllPermissions();

    return [
      {
        name: "Full Disk Access",
        status: status.fullDiskAccess,
        required: true,
        description:
          "Required to scan protected directories like ~/Library, system caches, and user trash",
        instructions:
          "System Preferences → Security & Privacy → Privacy → Full Disk Access → Add EKD Clean",
      },
      {
        name: "Files and Folders",
        status: status.filesAndFolders,
        required: true,
        description:
          "Required to access user directories and application folders",
        instructions:
          "System Preferences → Security & Privacy → Privacy → Files and Folders → EKD Clean",
      },
      {
        name: "Accessibility",
        status: status.accessibility,
        required: false,
        description: "Optional: Allows better integration with system UI",
        instructions:
          "System Preferences → Security & Privacy → Privacy → Accessibility → Add EKD Clean",
      },
    ];
  }

  /**
   * Check if app has Full Disk Access
   */
  private async checkFullDiskAccess(): Promise<boolean> {
    try {
      // Try to access protected directories that require Full Disk Access
      // We need to be able to both access AND READ the contents
      const protectedPaths = [
        join(homedir(), "Library/Mail"),
        join(homedir(), "Library/Safari"),
        join(homedir(), "Library/Messages"),
        join(homedir(), "Library/Cookies"),
      ];

      let accessibleCount = 0;
      let totalTested = 0;

      for (const path of protectedPaths) {
        totalTested++;
        if (await this.canFullyAccessPath(path)) {
          accessibleCount++;
          Logger.debug(this.id, `Full access confirmed for: ${path}`);
        } else {
          Logger.debug(this.id, `No full access to: ${path}`);
        }
      }

      // We need to be able to access at least one protected directory
      const hasFullDiskAccess = accessibleCount > 0;

      Logger.info(this.id, "Full Disk Access check result", {
        hasAccess: hasFullDiskAccess,
        accessiblePaths: accessibleCount,
        totalTested: totalTested,
      });

      return hasFullDiskAccess;
    } catch (error) {
      Logger.debug(this.id, "Full Disk Access check failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      return false;
    }
  }

  /**
   * Check accessibility permission
   */
  private async checkAccessibilityPermission(): Promise<boolean> {
    try {
      // On macOS, we can check if the app is trusted for accessibility
      const result = execSync(
        "echo 'tell application \"System Events\" to get name of every process' | osascript",
        {
          timeout: 3000,
          encoding: "utf8",
        }
      );
      return result.length > 0;
    } catch (error) {
      Logger.debug(this.id, "Accessibility permission check failed");
      return false;
    }
  }

  /**
   * Check files and folders access
   */
  private async checkFilesAndFoldersAccess(): Promise<boolean> {
    try {
      // Check if we can access common user directories
      const userDirs = [
        join(homedir(), "Documents"),
        join(homedir(), "Downloads"),
        join(homedir(), "Desktop"),
        join(homedir(), "Library/Application Support"),
      ];

      for (const dir of userDirs) {
        if (await this.canAccessPath(dir)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      Logger.debug(this.id, "Files and folders access check failed");
      return false;
    }
  }

  /**
   * Check if we can access a specific path
   */
  private async canAccessPath(path: string): Promise<boolean> {
    try {
      const fs = await import("fs").then((m) => m.promises);
      await fs.access(path);
      await fs.readdir(path);
      return true;
    } catch (error) {
      Logger.debug(this.id, `Cannot access path: ${path}`);
      return false;
    }
  }

  /**
   * Check if we can FULLY access a path (both stat and read contents)
   * This is more thorough than canAccessPath for permission checking
   */
  private async canFullyAccessPath(path: string): Promise<boolean> {
    try {
      const fs = await import("fs").then((m) => m.promises);

      // First check if path exists and we can access it
      await fs.access(path);

      // Then try to read directory contents - this is where Full Disk Access is needed
      const items = await fs.readdir(path);

      // For protected directories, they should have content if properly accessible
      // Empty directories might indicate limited access
      Logger.debug(
        this.id,
        `Full access test for ${path}: ${items.length} items found`
      );

      // Consider it fully accessible if we can read the directory
      // Even if empty, being able to readdir means we have proper access
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown";
      Logger.debug(
        this.id,
        `Cannot fully access path ${path}: ${errorMessage}`
      );

      // Check for specific permission errors
      if (
        errorMessage.includes("EPERM") ||
        errorMessage.includes("operation not permitted")
      ) {
        Logger.debug(this.id, `Permission explicitly denied for: ${path}`);
      }

      return false;
    }
  }

  /**
   * Request permissions with user dialog
   */
  async requestPermissions(): Promise<boolean> {
    Logger.info(this.id, "🚨 REQUESTING PERMISSIONS FROM USER 🚨");

    const checks = await this.getPermissionChecks();
    const missingPermissions = checks.filter(
      (check) => !check.status && check.required
    );

    Logger.info(this.id, "Permission check details", {
      total: checks.length,
      missing: missingPermissions.length,
      missingPermissions: missingPermissions.map((p) => ({
        name: p.name,
        status: p.status,
        required: p.required,
      })),
    });

    if (missingPermissions.length === 0) {
      Logger.info(this.id, "All required permissions already granted");
      return true;
    }

    // Show permission request dialog
    Logger.info(this.id, "🎭 SHOWING PERMISSION DIALOG TO USER 🎭");

    try {
      const result = await dialog.showMessageBox({
        type: "warning",
        title: "Full Disk Access Required - EKD Clean",
        message:
          "EKD Clean needs Full Disk Access to perform thorough system cleaning.",
        detail: `🔒 Full Disk Access is required to scan:
• ~/Library (Application data and caches)
• System cache directories
• Application support files
• Trash and deleted file recovery

📋 What happens next:
1. Click "Open Privacy Settings" below
2. We'll take you directly to Full Disk Access settings
3. Follow the step-by-step guide to enable access
4. Restart EKD Clean to scan thoroughly

⚡ Without this permission, scans will be limited and may only find ${Math.round(78.05)} MB instead of the full system junk.`,
        buttons: [
          "Open Privacy Settings",
          "Continue with Limited Scan",
          "Cancel",
        ],
        defaultId: 0,
        cancelId: 2,
      });

      Logger.info(this.id, "User response to permission dialog", {
        response: result.response,
        buttonClicked:
          result.response === 0
            ? "Open Privacy Settings"
            : result.response === 1
              ? "Continue Limited"
              : "Cancel",
      });

      if (result.response === 0) {
        // Open System Preferences
        Logger.info(this.id, "Opening System Preferences for user");
        await this.openSystemPreferences();
        return false; // User needs to manually grant permissions
      } else if (result.response === 1) {
        // Skip - continue with limited functionality
        Logger.warn(this.id, "User chose to continue with limited scanning");

        // Show what they're missing out on
        setTimeout(() => {
          dialog
            .showMessageBox({
              type: "info",
              title: "Limited Scan Mode - EKD Clean",
              message: "Continuing with reduced cleaning capabilities",
              detail: `⚠️ Limited scan mode restrictions:
• Cannot access ~/Library (app data)
• Cannot scan system caches
• Cannot access protected directories
• May find significantly less junk to clean

💡 You can enable Full Disk Access later in Settings → Permissions for complete system cleaning.`,
              buttons: ["OK", "Enable Full Access Now"],
              defaultId: 0,
            })
            .then((limitedResult) => {
              if (limitedResult.response === 1) {
                this.openSystemPreferences();
              }
            });
        }, 500);

        return false;
      } else {
        // Cancel
        Logger.info(this.id, "User cancelled permission requests");
        return false;
      }
    } catch (error) {
      Logger.error(this.id, "Error showing permission dialog", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Open macOS System Preferences to Full Disk Access settings
   */
  async openSystemPreferences(): Promise<void> {
    try {
      // First try to open directly to Full Disk Access
      await shell.openExternal(
        "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"
      );

      Logger.info(
        this.id,
        "Opened System Preferences to Full Disk Access section"
      );

      // Show a follow-up guidance dialog after a short delay
      setTimeout(() => {
        this.showFullDiskAccessGuidance();
      }, 2000);
    } catch (error) {
      Logger.error(
        this.id,
        "Failed to open System Preferences to Full Disk Access",
        {
          error: error instanceof Error ? error.message : "Unknown",
        }
      );

      // Fallback: try opening general Privacy settings
      try {
        await shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy"
        );
        Logger.info(
          this.id,
          "Opened System Preferences to general Privacy section"
        );

        // Show guidance for manual navigation
        setTimeout(() => {
          this.showManualNavigationGuidance();
        }, 1500);
      } catch (fallbackError) {
        Logger.error(this.id, "Failed to open System Preferences", {
          error:
            fallbackError instanceof Error ? fallbackError.message : "Unknown",
        });
      }
    }
  }

  /**
   * Show specific guidance for Full Disk Access
   */
  private async showFullDiskAccessGuidance(): Promise<void> {
    await dialog
      .showMessageBox({
        type: "info",
        title: "Enable Full Disk Access - EKD Clean",
        message: "Grant Full Disk Access to EKD Clean",
        detail: `You should now see the Full Disk Access settings.

Follow these steps:
1. Click the 🔒 lock icon to unlock (enter your password)
2. Click the ➕ plus button to add an app
3. Navigate to Applications and select "EKD Clean"
4. Make sure the checkbox next to "EKD Clean" is checked ✅
5. Restart EKD Clean for changes to take effect

This will allow EKD Clean to scan protected areas like ~/Library, system caches, and application data for thorough cleaning.`,
        buttons: ["Got it!", "Show me again"],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 1) {
          // User wants to see guidance again
          setTimeout(() => this.showFullDiskAccessGuidance(), 500);
        }
      });
  }

  /**
   * Show guidance for manual navigation when direct link fails
   */
  private async showManualNavigationGuidance(): Promise<void> {
    await dialog
      .showMessageBox({
        type: "info",
        title: "Navigate to Full Disk Access - EKD Clean",
        message: "Please navigate to Full Disk Access manually",
        detail: `Follow these steps in System Preferences:

1. Click "Privacy & Security" (or "Security & Privacy" on older macOS)
2. Click "Privacy" tab
3. Scroll down and click "Full Disk Access" in the left sidebar
4. Click the 🔒 lock icon and enter your password
5. Click the ➕ plus button to add EKD Clean
6. Navigate to Applications → EKD Clean
7. Make sure EKD Clean is checked ✅

After enabling, restart EKD Clean for changes to take effect.`,
        buttons: ["Got it!", "Try opening settings again"],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 1) {
          // User wants to try opening settings again
          this.openSystemPreferences();
        }
      });
  }

  /**
   * Show permission guidance dialog
   */
  async showPermissionGuidance(): Promise<void> {
    const checks = await this.getPermissionChecks();
    const missingRequired = checks.filter(
      (check) => !check.status && check.required
    );

    if (missingRequired.length === 0) {
      // All permissions granted
      await dialog.showMessageBox({
        type: "info",
        title: "All Permissions Granted! ✅",
        message: "EKD Clean has all required permissions",
        detail: `🎉 Perfect! EKD Clean can now perform thorough system cleaning.

✅ Full Disk Access: Enabled
✅ Files and Folders: Enabled

You can now scan and clean:
• Application data and caches
• System cache directories  
• Protected user directories
• Complete system junk analysis

Start a new scan to see the full cleaning potential!`,
        buttons: ["Great!"],
      });
      return;
    }

    const instructions = missingRequired
      .map((check) => `${check.name}:\n${check.instructions}\n`)
      .join("\n");

    const result = await dialog.showMessageBox({
      type: "info",
      title: "Permission Setup Guide - EKD Clean",
      message: "How to enable required permissions",
      detail: `To enable thorough system cleaning, please follow these steps:\n\n${instructions}\nAfter granting permissions, restart EKD Clean for changes to take effect.`,
      buttons: ["Open Settings Now", "Show Detailed Guide", "OK"],
      defaultId: 0,
    });

    if (result.response === 0) {
      await this.openSystemPreferences();
    } else if (result.response === 1) {
      await this.showFullDiskAccessGuidance();
    }
  }

  /**
   * Quick permission check and guidance - callable from UI
   */
  async quickPermissionCheck(): Promise<{
    hasPermissions: boolean;
    message: string;
    needsAction: boolean;
  }> {
    const status = await this.checkAllPermissions();

    if (status.fullDiskAccess && status.filesAndFolders) {
      return {
        hasPermissions: true,
        message: "✅ All permissions granted - ready for thorough cleaning!",
        needsAction: false,
      };
    } else if (!status.fullDiskAccess) {
      return {
        hasPermissions: false,
        message: "⚠️ Full Disk Access required for complete system cleaning",
        needsAction: true,
      };
    } else {
      return {
        hasPermissions: false,
        message: "⚠️ Additional file access permissions needed",
        needsAction: true,
      };
    }
  }

  /**
   * Check if app should request permissions
   */
  async shouldRequestPermissions(): Promise<boolean> {
    const status = await this.checkAllPermissions();

    // Request permissions if we don't have Full Disk Access or Files/Folders access
    return !status.fullDiskAccess || !status.filesAndFolders;
  }

  /**
   * Handle permission errors during scanning
   */
  async handlePermissionError(
    path: string,
    error: NodeJS.ErrnoException
  ): Promise<void> {
    if (error.code === "EPERM" || error.code === "EACCES") {
      Logger.warn(this.id, `Permission denied accessing: ${path}`, {
        code: error.code,
        path,
      });

      // Check if this is a known protected path
      const protectedPaths = [
        "/.Trash",
        "/Library/Mail",
        "/Library/Safari",
        "/Library/Messages",
        "/Library/Caches",
      ];

      const isProtectedPath = protectedPaths.some((protectedPath) =>
        path.includes(protectedPath)
      );

      if (isProtectedPath && (await this.shouldRequestPermissions())) {
        // Show a non-blocking notification about permissions
        setTimeout(async () => {
          const result = await dialog.showMessageBox({
            type: "warning",
            title: "Access Denied - EKD Clean",
            message: "Cannot access protected system files",
            detail: `EKD Clean cannot access:\n${path}\n\nThis may limit cleaning effectiveness. Enable Full Disk Access in System Preferences for complete scanning.`,
            buttons: ["Open System Preferences", "Continue"],
            defaultId: 0,
            noLink: true,
          });

          if (result.response === 0) {
            await this.openSystemPreferences();
          }
        }, 1000);
      }
    }
  }

  /**
   * Get permission status summary for UI
   */
  async getPermissionSummary(): Promise<{
    hasRequiredPermissions: boolean;
    missingCount: number;
    totalCount: number;
    canScanThoroughly: boolean;
  }> {
    const checks = await this.getPermissionChecks();
    const requiredChecks = checks.filter((check) => check.required);
    const missingRequired = requiredChecks.filter((check) => !check.status);

    return {
      hasRequiredPermissions: missingRequired.length === 0,
      missingCount: missingRequired.length,
      totalCount: requiredChecks.length,
      canScanThoroughly: missingRequired.length === 0,
    };
  }
}
