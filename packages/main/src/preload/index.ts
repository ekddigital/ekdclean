// EKD Clean - Preload Script
// Built by EKD Digital

import { contextBridge, ipcRenderer } from "electron";
import { SystemInfo, ScanResult, CleanResult, ActivityItem } from "../types";

export interface ElectronAPI {
  // System Information
  getSystemInfo: () => Promise<SystemInfo>;
  getMemoryUsage: () => Promise<{
    used: number;
    total: number;
    percentage: number;
  }>;

  // Real scanning and cleaning
  scanSystem: () => Promise<ScanResult[]>;
  cleanFiles: (scanResults: ScanResult[]) => Promise<CleanResult>;

  // Activity tracking
  getRecentActivity: () => Promise<ActivityItem[]>;

  // Legacy compatibility
  scanForJunk: () => Promise<ScanResult[]>;

  // Window Management
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // Events
  onUpdateProgress: (callback: (progress: number) => void) => void;
  onOperationComplete: (callback: (result: any) => void) => void;
  onCleanProgress: (
    callback: (progress: {
      current: number;
      total: number;
      currentCategory: string;
      filesRemoved: number;
      spaceFreed: number;
    }) => void
  ) => void;
  offCleanProgress: (callback: (event: any, progress: any) => void) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // System Information
  getSystemInfo: (): Promise<SystemInfo> =>
    ipcRenderer.invoke("get-system-info"),

  getMemoryUsage: () => ipcRenderer.invoke("get-memory-usage"),

  // Real scanning and cleaning
  scanSystem: (): Promise<ScanResult[]> => ipcRenderer.invoke("scan-system"),

  cleanFiles: (scanResults: ScanResult[]): Promise<CleanResult> =>
    ipcRenderer.invoke("clean-files", scanResults),

  // Activity tracking
  getRecentActivity: (): Promise<ActivityItem[]> =>
    ipcRenderer.invoke("get-recent-activity"),

  // Legacy compatibility
  scanForJunk: (): Promise<ScanResult[]> => ipcRenderer.invoke("scan-for-junk"),

  // Window Management
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),

  // Events
  onUpdateProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on("update-progress", (_event, progress) => callback(progress));
  },

  onOperationComplete: (callback: (result: any) => void) => {
    ipcRenderer.on("operation-complete", (_event, result) => callback(result));
  },

  // Clean progress events
  onCleanProgress: (
    callback: (progress: {
      current: number;
      total: number;
      currentCategory: string;
      filesRemoved: number;
      spaceFreed: number;
    }) => void
  ) => {
    ipcRenderer.on("clean-progress", (_event, progress) => callback(progress));
  },

  offCleanProgress: (callback: (event: any, progress: any) => void) => {
    ipcRenderer.off("clean-progress", callback);
  },
} satisfies ElectronAPI);

// Add types to the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
