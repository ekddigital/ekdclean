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

  // New Scanner System
  getScanners: () => Promise<any[]>;
  runSmartScan: () => Promise<any[]>;
  runScanner: (scannerId: string, options?: any) => Promise<any[]>;
  cleanItems: (scannerId: string, items: any[], options?: any) => Promise<any>;
  
  // Quarantine Management
  getQuarantineItems: () => Promise<any[]>;
  restoreQuarantineItem: (quarantineId: string) => Promise<boolean>;
  clearQuarantine: (olderThanDays?: number) => Promise<number>;
  
  // Whitelist Management
  getWhitelistRules: () => Promise<any[]>;
  addWhitelistRule: (pattern: string, type: string, reason: string) => Promise<string>;
  removeWhitelistRule: (ruleId: string) => Promise<boolean>;

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
  onScanProgress: (callback: (data: { scanner: string; progress: number }) => void) => void;
  onScannerProgress: (callback: (data: { scannerId: string; progress: number }) => void) => void;
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

  // New Scanner System
  getScanners: () => ipcRenderer.invoke("get-scanners"),
  runSmartScan: () => ipcRenderer.invoke("run-smart-scan"),
  runScanner: (scannerId: string, options?: any) => 
    ipcRenderer.invoke("run-scanner", scannerId, options),
  cleanItems: (scannerId: string, items: any[], options?: any) => 
    ipcRenderer.invoke("clean-items", scannerId, items, options),
  
  // Quarantine Management
  getQuarantineItems: () => ipcRenderer.invoke("get-quarantine-items"),
  restoreQuarantineItem: (quarantineId: string) => 
    ipcRenderer.invoke("restore-quarantine-item", quarantineId),
  clearQuarantine: (olderThanDays?: number) => 
    ipcRenderer.invoke("clear-quarantine", olderThanDays),
  
  // Whitelist Management
  getWhitelistRules: () => ipcRenderer.invoke("get-whitelist-rules"),
  addWhitelistRule: (pattern: string, type: string, reason: string) => 
    ipcRenderer.invoke("add-whitelist-rule", pattern, type, reason),
  removeWhitelistRule: (ruleId: string) => 
    ipcRenderer.invoke("remove-whitelist-rule", ruleId),

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

  // New scan progress events
  onScanProgress: (callback: (data: { scanner: string; progress: number }) => void) => {
    ipcRenderer.on("scan-progress", (_event, data) => callback(data));
  },

  onScannerProgress: (callback: (data: { scannerId: string; progress: number }) => void) => {
    ipcRenderer.on("scanner-progress", (_event, data) => callback(data));
  },
} satisfies ElectronAPI);

// Add types to the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
