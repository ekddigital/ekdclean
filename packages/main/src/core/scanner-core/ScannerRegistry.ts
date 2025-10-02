// EKD Clean - Scanner Registry
// Built by EKD Digital

import { IScanner, ScannerCategory } from "./types";
import { Logger } from "../logger";

export class ScannerRegistry {
  private static scanners = new Map<string, IScanner>();
  private static categoryMap = new Map<ScannerCategory, string[]>();

  static register(scanner: IScanner, category: ScannerCategory): void {
    Logger.info("ScannerRegistry", `Registering scanner: ${scanner.id}`);
    
    this.scanners.set(scanner.id, scanner);
    
    const categoryList = this.categoryMap.get(category) || [];
    categoryList.push(scanner.id);
    this.categoryMap.set(category, categoryList);
  }

  static get(scannerId: string): IScanner | undefined {
    return this.scanners.get(scannerId);
  }

  static getByCategory(category: ScannerCategory): IScanner[] {
    const scannerIds = this.categoryMap.get(category) || [];
    return scannerIds
      .map(id => this.scanners.get(id))
      .filter((scanner): scanner is IScanner => scanner !== undefined);
  }

  static getAll(): IScanner[] {
    return Array.from(this.scanners.values());
  }

  static getAllCategories(): ScannerCategory[] {
    return Array.from(this.categoryMap.keys());
  }

  static getSupportedScanners(os: string): IScanner[] {
    const osMap: Record<string, string> = {
      darwin: "mac",
      win32: "win",
      linux: "linux",
    };

    const normalizedOS = osMap[os] || os;
    
    return this.getAll().filter(scanner =>
      scanner.supportedOS.includes(normalizedOS as any)
    );
  }
}
