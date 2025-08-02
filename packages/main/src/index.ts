// EKDimport { SystemInfo } from '../../shared/types';Clean - Main Electron Process
// Built by EKD Digital

import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { platform } from "os";
import { SystemInfo } from "./types";

class EKDCleanApp {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
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

  private setupIPCHandlers(): void {
    // Get system information
    // System Information Handler
    ipcMain.handle("get-system-info", async (): Promise<SystemInfo> => {
      const { totalmem, freemem, cpus } = await import("os");

      return {
        platform: platform(),
        arch: process.arch,
        totalMemory: totalmem(),
        freeMemory: freemem(),
        cpuCount: cpus().length,
        osVersion: process.getSystemVersion
          ? process.getSystemVersion()
          : "Unknown",
        nodeVersion: process.version,
        electronVersion: process.versions.electron || "Unknown",
        appVersion: app.getVersion(),
      };
    });

    // Scan for junk files
    ipcMain.handle("scan-for-junk", async () => {
      // TODO: Implement junk file scanning
      return [];
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

    // Clean files
    ipcMain.handle("clean-files", async (_event, filePaths: string[]) => {
      // TODO: Implement file cleaning
      return {
        success: true,
        filesDeleted: filePaths.length,
        spaceFreed: 0,
        errors: [],
      };
    });

    // Window controls
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
