// EKD Clean - Core Scanner Types
// Built by EKD Digital

export type ScanItem = {
  id: string;
  path: string;
  sizeBytes: number;
  discoveredAt: string;
  category: string;
  reason: string;
  safeToDelete: boolean;
  confidence: number; // 0-1 heuristic
  metadata?: Record<string, any>;
};

export type CancelToken = {
  cancelled: boolean;
  cancel: () => void;
};

export type ScanOptions = {
  dryRun: boolean;
  onProgress?: (progress: number) => void;
  cancelToken?: CancelToken;
};

export type PreviewResult = {
  items: ScanItem[];
  totalSize: number;
  estimatedTime?: number;
};

export type CleanResult = {
  success: boolean;
  itemsCleaned: number;
  spaceFreed: number;
  errors: string[];
  quarantined: boolean;
};

export type SupportedOS = "mac" | "win" | "linux";

export interface IScanner {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly supportedOS: SupportedOS[];
  
  scan(options: ScanOptions): Promise<ScanItem[]>;
  preview(items: ScanItem[], options?: any): Promise<PreviewResult>;
  clean(items: ScanItem[], options: { backup: boolean; quarantine: boolean }): Promise<CleanResult>;
  restore(quarantineId: string): Promise<boolean>;
  validate(item: ScanItem): Promise<boolean>;
}

export type ScannerCategory = 
  | "system-junk"
  | "photo-junk"
  | "mail-attachments"
  | "trash-bins"
  | "large-old-files"
  | "privacy"
  | "speed";

export type QuarantineEntry = {
  id: string;
  originalPath: string;
  quarantinePath: string;
  size: number;
  checksum: string;
  timestamp: string;
  category: string;
  metadata: Record<string, any>;
};
