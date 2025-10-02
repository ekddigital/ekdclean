// EKD Clean - Scanner Initialization
// Built by EKD Digital

import { platform } from "os";
import { ScannerRegistry } from "./core/scanner-core/ScannerRegistry";
import { SystemJunkScanner } from "./core/finders/SystemJunkScanner";
import { TrashBinsScanner } from "./core/finders/TrashBinsScanner";
import { LargeOldFilesScanner } from "./core/finders/LargeOldFilesScanner";
import { PhotoJunkScanner } from "./core/finders/PhotoJunkScanner";
import { MailAttachmentsScanner } from "./core/finders/MailAttachmentsScanner";
import { PrivacyScanner } from "./core/finders/PrivacyScanner";
import { Logger } from "./core/logger";

export function initializeScanners(): void {
  Logger.info("Scanners", "Initializing scanner registry");

  // Register all scanners
  ScannerRegistry.register(new SystemJunkScanner(), "system-junk");
  ScannerRegistry.register(new TrashBinsScanner(), "trash-bins");
  ScannerRegistry.register(new LargeOldFilesScanner(), "large-old-files");
  ScannerRegistry.register(new PhotoJunkScanner(), "photo-junk");
  ScannerRegistry.register(new MailAttachmentsScanner(), "mail-attachments");
  ScannerRegistry.register(new PrivacyScanner(), "privacy");

  const supportedScanners = ScannerRegistry.getSupportedScanners(platform());
  Logger.info("Scanners", `Initialized ${supportedScanners.length} scanners for ${platform()}`);
}

export async function runSmartScan(options: {
  dryRun?: boolean;
  onProgress?: (scanner: string, progress: number) => void;
}): Promise<any[]> {
  const scanners = ScannerRegistry.getSupportedScanners(platform());
  const allItems: any[] = [];

  Logger.info("SmartScan", `Running smart scan with ${scanners.length} scanners`);

  for (let i = 0; i < scanners.length; i++) {
    const scanner = scanners[i];
    
    try {
      Logger.info("SmartScan", `Running scanner: ${scanner.name}`);
      
      const items = await scanner.scan({
        dryRun: options.dryRun !== false,
        onProgress: (progress) => {
          if (options.onProgress) {
            const overallProgress = (i + progress) / scanners.length;
            options.onProgress(scanner.name, overallProgress);
          }
        },
      });

      allItems.push(...items);
      Logger.info("SmartScan", `${scanner.name} found ${items.length} items`);
    } catch (error) {
      Logger.error("SmartScan", `Scanner ${scanner.name} failed`, {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
  }

  Logger.info("SmartScan", `Smart scan complete. Found ${allItems.length} total items`);
  return allItems;
}
