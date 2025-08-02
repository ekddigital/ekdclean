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
  type: "cache" | "temp" | "log" | "download" | "trash" | "duplicate";
  lastModified: Date;
  safe: boolean;
}

export interface CleanResult {
  filesRemoved: number;
  spaceFreed: number;
  errors: string[];
  duration: number;
}

// Electron API types
export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
