// EKD Clean - Base Scanner Implementation
// Built by EKD Digital

import { IScanner, ScanItem, ScanOptions, PreviewResult, CleanResult, SupportedOS } from "./types";

export abstract class BaseScanner implements IScanner {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly supportedOS: SupportedOS[];

  abstract scan(options: ScanOptions): Promise<ScanItem[]>;

  async preview(items: ScanItem[], _options?: any): Promise<PreviewResult> {
    const totalSize = items.reduce((sum, item) => sum + item.sizeBytes, 0);
    const estimatedTime = this.estimateCleanTime(items);

    return {
      items,
      totalSize,
      estimatedTime,
    };
  }

  abstract clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult>;

  abstract restore(quarantineId: string): Promise<boolean>;

  async validate(item: ScanItem): Promise<boolean> {
    // Basic validation - subclasses can override
    return (
      item.path !== "" &&
      item.sizeBytes >= 0 &&
      item.confidence >= 0 &&
      item.confidence <= 1
    );
  }

  protected estimateCleanTime(items: ScanItem[]): number {
    // Estimate ~1ms per MB
    const totalMB = items.reduce((sum, item) => sum + item.sizeBytes / (1024 * 1024), 0);
    return Math.ceil(totalMB);
  }

  protected createCancelToken(): { token: any; cancel: () => void } {
    const token = { cancelled: false };
    const cancel = () => {
      token.cancelled = true;
    };
    return { token, cancel };
  }
}
