// EKD Clean - Application Management IPC Handlers
// Built by EKD Digital

import { ipcMain } from "electron";
import { Logger } from "../core/logger";
import {
  ApplicationManager,
  ApplicationInfo,
} from "../core/app-management/ApplicationManager";

export function setupApplicationIPCHandlers(): void {
  Logger.info(
    "ApplicationIPC",
    "🔌 Setting up Application Management IPC handlers"
  );

  // Get applications blocking file cleaning
  ipcMain.handle(
    "app:analyze-file-locks",
    async (_event, filePaths: string[]) => {
      try {
        Logger.info(
          "ApplicationIPC",
          `🔍 Analyzing file locks for ${filePaths.length} paths`
        );

        const appManager = ApplicationManager.getInstance();
        const closurePrompt = await appManager.analyzeFileLocks(filePaths);

        Logger.info("ApplicationIPC", "File lock analysis complete", {
          hasBlockingApps: !!closurePrompt,
          appsCount: closurePrompt?.applications.length || 0,
        });

        return {
          success: true,
          data: closurePrompt,
        };
      } catch (error) {
        Logger.error("ApplicationIPC", "Failed to analyze file locks", {
          error: error instanceof Error ? error.message : "Unknown",
          filePaths: filePaths.length,
        });

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to analyze file locks",
        };
      }
    }
  );

  // Close specific applications
  ipcMain.handle(
    "app:close-applications",
    async (_event, apps: ApplicationInfo[], force: boolean = false) => {
      try {
        Logger.info(
          "ApplicationIPC",
          `🚪 Closing ${apps.length} applications`,
          {
            force,
            appNames: apps.map((app) => app.name),
          }
        );

        const appManager = ApplicationManager.getInstance();
        const result = await appManager.closeApplications(apps, force);

        Logger.info("ApplicationIPC", "Application closure complete", {
          closed: result.closed.length,
          failed: result.failed.length,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        Logger.error("ApplicationIPC", "Failed to close applications", {
          error: error instanceof Error ? error.message : "Unknown",
          appCount: apps.length,
        });

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to close applications",
        };
      }
    }
  );

  // Verify applications are closed
  ipcMain.handle(
    "app:verify-closed",
    async (_event, apps: ApplicationInfo[]) => {
      try {
        Logger.info(
          "ApplicationIPC",
          `🔍 Verifying ${apps.length} applications are closed`
        );

        const appManager = ApplicationManager.getInstance();
        const result = await appManager.verifyApplicationsClosed(apps);

        Logger.info("ApplicationIPC", "Application verification complete", {
          stillRunning: result.stillRunning.length,
          closed: result.closed.length,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        Logger.error("ApplicationIPC", "Failed to verify applications", {
          error: error instanceof Error ? error.message : "Unknown",
          appCount: apps.length,
        });

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to verify applications",
        };
      }
    }
  );

  // Get all running applications (for UI)
  ipcMain.handle("app:get-running", async (_event) => {
    try {
      Logger.info("ApplicationIPC", "📱 Getting all running applications");

      const appManager = ApplicationManager.getInstance();
      const apps = await appManager.getRunningApplications();

      Logger.info(
        "ApplicationIPC",
        `Found ${apps.length} running applications`
      );

      return {
        success: true,
        data: apps,
      };
    } catch (error) {
      Logger.error("ApplicationIPC", "Failed to get running applications", {
        error: error instanceof Error ? error.message : "Unknown",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get running applications",
      };
    }
  });

  Logger.info(
    "ApplicationIPC",
    "✅ Application Management IPC handlers registered"
  );
}
