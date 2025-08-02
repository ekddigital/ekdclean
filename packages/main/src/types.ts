// EKD Clean - Main Process Types
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

export interface ActivityItem {
  id: string;
  type: "scan" | "clean" | "optimize";
  title: string;
  subtitle: string;
  timestamp: Date;
  status: "completed" | "running" | "error";
  details?: string;
}
