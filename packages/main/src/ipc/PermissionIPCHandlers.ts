// EKD Clean - Permission IPC Handlers
// Built by EKD Digital - Expose permission functionality to renderer

import { ipcMain } from "electron";
import { PermissionManager } from "../core/permissions/PermissionManager";

export class PermissionIPCHandlers {
  private permissionManager: PermissionManager;

  constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Check all permissions
    ipcMain.handle("permissions:checkAll", async () => {
      return await this.permissionManager.checkAllPermissions();
    });

    // Get detailed permission checks with instructions
    ipcMain.handle("permissions:getChecks", async () => {
      return await this.permissionManager.getPermissionChecks();
    });

    // Get permission summary for UI
    ipcMain.handle("permissions:getSummary", async () => {
      return await this.permissionManager.getPermissionSummary();
    });

    // Check if app should request permissions
    ipcMain.handle("permissions:shouldRequest", async () => {
      return await this.permissionManager.shouldRequestPermissions();
    });

    // Request permissions from user
    ipcMain.handle("permissions:request", async () => {
      return await this.permissionManager.requestPermissions();
    });

    // Show permission guidance dialog
    ipcMain.handle("permissions:showGuidance", async () => {
      return await this.permissionManager.showPermissionGuidance();
    });

    // Open System Preferences
    ipcMain.handle("permissions:openSystemPreferences", async () => {
      return await this.permissionManager.openSystemPreferences();
    });

    // Quick permission check for UI
    ipcMain.handle("permissions:quickCheck", async () => {
      return await this.permissionManager.quickPermissionCheck();
    });
  }

  /**
   * Remove all IPC handlers when shutting down
   */
  public destroy(): void {
    ipcMain.removeAllListeners("permissions:checkAll");
    ipcMain.removeAllListeners("permissions:getChecks");
    ipcMain.removeAllListeners("permissions:getSummary");
    ipcMain.removeAllListeners("permissions:shouldRequest");
    ipcMain.removeAllListeners("permissions:request");
    ipcMain.removeAllListeners("permissions:showGuidance");
    ipcMain.removeAllListeners("permissions:openSystemPreferences");
    ipcMain.removeAllListeners("permissions:quickCheck");
  }
}
