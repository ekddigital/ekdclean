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
  uptime: number;
  loadAverage: number[];
  homeDirectory: string;
  tempDirectory: string;
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
  type: "scan" | "clean" | "optimize" | "update";
  title: string;
  description: string;
  timestamp: Date;
  size?: number;
  status: "completed" | "failed" | "in-progress";
}

// Electron API types
export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  startScan: (categories: string[]) => Promise<void>;
  getScanProgress: () => Promise<{ progress: number; currentFile: string }>;
  getScanResults: () => Promise<ScanResult>;
  cleanFiles: (filePaths: string[]) => Promise<CleanResult>;
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
