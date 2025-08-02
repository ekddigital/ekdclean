// EKD Clean - Renderer Types
// Built by EKD Digital

export interface SystemInfo {
  platform: string;
  arch: string;
  totalMemory: number;
  freeMemory: number;
  cpuCount: number;
  osVersion: string;
  nodeVersion: string;
  electronVersion: string;
  appVersion: string;
}

export interface JunkFile {
  path: string;
  size: number;
  type:
    | "cache"
    | "temp"
    | "log"
    | "download"
    | "trash"
    | "duplicate"
    | "system";
  lastModified: Date;
  safe: boolean;
  description: string;
}

export interface ScanResult {
  id: string;
  name: string;
  type: "cache" | "temp" | "log" | "duplicate" | "large" | "trash";
  size: number;
  files: number;
  path: string;
  description: string;
  safe: boolean;
  scanTime: Date;
}

export interface OldScanResult {
  junkFiles: JunkFile[];
  totalSize: number;
  categories: {
    cache: { count: number; size: number };
    temp: { count: number; size: number };
    logs: { count: number; size: number };
    downloads: { count: number; size: number };
    trash: { count: number; size: number };
    duplicates: { count: number; size: number };
    system: { count: number; size: number };
  };
  scanDuration: number;
  timestamp: Date;
}

export interface CleanResult {
  filesRemoved: number;
  spaceFreed: number;
  errors: string[];
  duration: number;
  categories: string[];
}

export interface ActivityItem {
  id: string;
  type: "scan" | "clean" | "optimize";
  title: string;
  subtitle: string;
  timestamp: Date;
  status: "completed" | "running" | "error";
  details?: string;
}

// Electron API types
export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  scanSystem: () => Promise<ScanResult[]>;
  getMemoryUsage: () => Promise<{
    used: number;
    total: number;
    percentage: number;
  }>;
  getRecentActivity: () => Promise<ActivityItem[]>;
  cleanFiles: (scanResults: ScanResult[]) => Promise<CleanResult>;
  // Legacy methods for compatibility
  startScan: (categories: string[]) => Promise<void>;
  getScanProgress: () => Promise<{ progress: number; currentFile: string }>;
  getScanResults: () => Promise<ScanResult>;
  getActivityHistory: () => Promise<ActivityItem[]>;
  onScanProgress: (
    callback: (progress: { progress: number; currentFile: string }) => void
  ) => void;
  onScanComplete: (callback: (results: ScanResult) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
