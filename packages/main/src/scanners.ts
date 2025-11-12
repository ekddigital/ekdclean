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
import { SpeedScanner } from "./core/finders/SpeedScanner";
import { ScanItem } from "./core/scanner-core/types";
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
  ScannerRegistry.register(new SpeedScanner(), "speed");

  const supportedScanners = ScannerRegistry.getSupportedScanners(platform());
  Logger.info(
    "Scanners",
    `Initialized ${supportedScanners.length} scanners for ${platform()}`
  );
}

export async function runSmartScan(
  progressCallback?: (progress: number) => void
): Promise<ScanItem[]> {
  Logger.info("Scanners", "🚀 Starting smart scan");

  // Get all supported scanners for the current platform
  const scanners = ScannerRegistry.getSupportedScanners(platform());
  const totalScanners = scanners.length;

  // DEBUG: Log which scanners are being returned
  const scannerNames = scanners.map((scanner) => scanner.constructor.name);
  Logger.info(
    "Scanners",
    `🔍 Running scan with ${totalScanners} scanners on ${platform()}: ${scannerNames.join(", ")}`
  );

  const allItems: ScanItem[] = [];
  let completedScanners = 0;

  for (const scanner of scanners) {
    try {
      Logger.info("Scanners", `Starting scan with ${scanner.constructor.name}`);

      const items = await scanner.scan({ dryRun: false });

      Logger.info(
        "Scanners",
        `✅ ${scanner.constructor.name} completed: ${items.length} items found`
      );

      allItems.push(...items);

      completedScanners++;
      if (progressCallback) {
        progressCallback(completedScanners / totalScanners);
      }
    } catch (error) {
      Logger.error(
        "Scanners",
        `❌ Error in ${scanner.constructor.name}: ${error}`
      );
    }
  }

  Logger.info(
    "Scanners",
    `🏁 Smart scan completed: ${allItems.length} total items found`
  );
  return allItems;
}
