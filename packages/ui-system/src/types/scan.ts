// EKD Clean - CircularScanButton Type Definitions
// Built by EKD Digital - Superior to CleanMyMac

export type ScanState =
  | "idle"
  | "indeterminate"
  | "scanning"
  | "paused"
  | "done"
  | "error";

export interface ScanProgress {
  state: ScanState;
  progress: number; // 0..1
  message?: string;
  stage?: string;
  estimatedTimeRemaining?: number; // seconds
  filesScanned?: number;
  totalFiles?: number;
}

export interface CircularScanButtonProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  state: ScanState;
  label?: string;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface ScanResult {
  category: string;
  items: ScannedItem[];
  totalSize: number;
  totalCount: number;
  recommended: boolean;
}

export interface ScannedItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: "file" | "folder" | "cache" | "log" | "temp";
  lastModified: Date;
  safe: boolean;
  selected: boolean;
}
