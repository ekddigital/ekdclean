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
  category: string; // e.g., "System Caches", "Application Logs"
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

// Application Management types for renderer
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

export interface ApplicationCloseResult {
  closed: ApplicationInfo[];
  failed: ApplicationInfo[];
}

export interface ApplicationVerificationResult {
  stillRunning: ApplicationInfo[];
  closed: ApplicationInfo[];
}

// Electron API types
export interface ElectronAPI {
  // Core system methods
  getSystemInfo: () => Promise<SystemInfo>;
  scanSystem: () => Promise<ScanResult[]>;
  scanSpecific: (scannerId: string) => Promise<ScanResult[]>;
  getMemoryUsage: () => Promise<{
    used: number;
    total: number;
    percentage: number;
  }>;
  getRecentActivity: () => Promise<ActivityItem[]>;
  cleanFiles: (scanResults: ScanResult[]) => Promise<CleanResult>;

  // Permission Management
  checkAllPermissions: () => Promise<any>;
  getPermissionChecks: () => Promise<any[]>;
  getPermissionSummary: () => Promise<any>;
  shouldRequestPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  showPermissionGuidance: () => Promise<boolean>;
  openSystemPreferences: () => Promise<boolean>;

  // Generic invoke method for IPC
  invoke: (channel: string, ...args: any[]) => Promise<any>;

  // IPC event methods for progress tracking
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
