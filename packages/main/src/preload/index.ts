// EKD Clean - Preload Script
// Built by EKD Digital

import { contextBridge, ipcRenderer } from "electron";
import { SystemInfo, JunkFile, CleanResult } from "../types";

export interface ElectronAPI {
  // System Information
  getSystemInfo: () => Promise<SystemInfo>;

  // File Operations
  scanForJunk: () => Promise<JunkFile[]>;
  cleanFiles: (filePaths: string[]) => Promise<CleanResult>;

  // Window Management
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // Events
  onUpdateProgress: (callback: (progress: number) => void) => void;
  onOperationComplete: (callback: (result: any) => void) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // System Information
  getSystemInfo: (): Promise<SystemInfo> =>
    ipcRenderer.invoke("get-system-info"),

  // File Operations
  scanForJunk: (): Promise<JunkFile[]> => ipcRenderer.invoke("scan-for-junk"),

  cleanFiles: (filePaths: string[]): Promise<CleanResult> =>
    ipcRenderer.invoke("clean-files", filePaths),

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
} satisfies ElectronAPI);

// Add types to the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
