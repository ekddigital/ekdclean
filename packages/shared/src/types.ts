// EKD Clean - Shared Types and Interfaces
// Built by EKD Digital

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  uptime: number;
  totalMemory: number;
  freeMemory: number;
  cpuCount: number;
}

export interface DiskSpace {
  total: number;
  free: number;
  used: number;
  percentage: number;
}

export interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
}

export interface JunkFile {
  path: string;
  size: number;
  type: "cache" | "log" | "temp" | "download" | "trash" | "other";
  lastModified: Date;
  safe: boolean;
}

export interface DuplicateGroup {
  id: string;
  files: Array<{
    path: string;
    size: number;
    hash: string;
    lastModified: Date;
  }>;
  totalSize: number;
  duplicateCount: number;
}

export interface LargeFile {
  path: string;
  size: number;
  type: string;
  lastAccessed: Date;
  lastModified: Date;
}

export interface ThreatDetection {
  path: string;
  type: "malware" | "adware" | "suspicious" | "pup";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  action: "quarantine" | "delete" | "monitor";
}

export interface CacheFile {
  path: string;
  size: number;
  application: string;
  type: "browser" | "system" | "app";
  safe: boolean;
}

export interface BrowserCache {
  browser: "chrome" | "firefox" | "safari" | "edge" | "other";
  type: "cache" | "cookies" | "history" | "downloads";
  path: string;
  size: number;
}

// Windows-specific types
export interface RegistryIssue {
  key: string;
  value?: string;
  type: "orphaned" | "invalid" | "obsolete";
  severity: "low" | "medium" | "high";
  safe: boolean;
}

export interface LogEntry {
  timestamp: Date;
  level: "info" | "warning" | "error" | "critical";
  source: string;
  message: string;
}

// macOS-specific types
export interface LaunchAgent {
  path: string;
  name: string;
  enabled: boolean;
  autoStart: boolean;
  runAtLoad: boolean;
}

export interface PrefFile {
  path: string;
  domain: string;
  size: number;
  lastModified: Date;
  orphaned: boolean;
}

// Linux-specific types
export interface Package {
  name: string;
  version: string;
  installed: boolean;
  size: number;
  orphaned: boolean;
  dependencies: string[];
}

export interface Service {
  name: string;
  status: "active" | "inactive" | "failed" | "disabled";
  enabled: boolean;
  description: string;
}

// Cleaning results
export interface CleanResult {
  filesRemoved: number;
  spaceFreed: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface StartupOptimization {
  itemsDisabled: number;
  timeImprovement: number;
  items: Array<{
    name: string;
    path: string;
    impact: "low" | "medium" | "high";
    disabled: boolean;
  }>;
}

// Application management
export interface Application {
  name: string;
  version: string;
  path: string;
  size: number;
  lastUsed: Date;
  vendor: string;
  uninstallable: boolean;
}

// Animation and UI types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  repeat?: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface ScanProgress {
  stage: "initializing" | "scanning" | "analyzing" | "complete";
  progress: number;
  currentPath: string;
  filesScanned: number;
  totalFiles: number;
  issuesFound: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Settings and preferences
export interface UserSettings {
  theme: "light" | "dark" | "auto";
  autoScan: boolean;
  scanSchedule: "daily" | "weekly" | "monthly";
  notifications: boolean;
  soundEffects: boolean;
  animations: boolean;
  language: string;
  safeMode: boolean;
}
