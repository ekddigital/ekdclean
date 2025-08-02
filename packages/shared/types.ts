// EKD Clean - Simplified Types
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
  type: "cache" | "log" | "temp" | "download" | "trash" | "other";
  lastModified: Date;
  safe: boolean;
}

export interface CleanResult {
  filesRemoved: number;
  spaceFreed: number;
  errors: string[];
  warnings: string[];
  duration: number;
}
