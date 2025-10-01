# EKD Clean - Scanner Implementation Guide

**Built by EKD Digital**

## Introduction

This guide explains how to implement new scanners for EKD Clean. All scanners follow a consistent architecture and safety-first design.

## Quick Start

### 1. Create Scanner Class

```typescript
import { BaseScanner } from "../scanner-core/BaseScanner";
import { ScanItem, ScanOptions, CleanResult, SupportedOS } from "../scanner-core/types";
import { Logger } from "../logger";

export class MyScanner extends BaseScanner {
  readonly id = "my-scanner";
  readonly name = "My Scanner";
  readonly description = "What this scanner does";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting scan");
    const items: ScanItem[] = [];
    
    // Your scanning logic here
    
    return items;
  }

  async clean(
    items: ScanItem[],
    options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    // Use FileOperations.safeDelete
    const paths = items.map(item => item.path);
    const result = await FileOperations.safeDelete(paths, this.id, {
      quarantine: options.quarantine,
      dryRun: false,
    });

    return {
      success: result.success,
      itemsCleaned: result.filesDeleted,
      spaceFreed: result.spaceFreed,
      errors: result.errors,
      quarantined: options.quarantine,
    };
  }

  async restore(quarantineId: string): Promise<boolean> {
    const { QuarantineManager } = await import("../file-ops/quarantine");
    return await QuarantineManager.restoreFile(quarantineId);
  }
}
```

### 2. Register Scanner

In `packages/main/src/scanners.ts`:

```typescript
import { MyScanner } from "./core/finders/MyScanner";

export function initializeScanners(): void {
  // ... existing scanners
  ScannerRegistry.register(new MyScanner(), "my-category");
}
```

### 3. Add to Exports

In `packages/main/src/core/index.ts`:

```typescript
export { MyScanner } from "./finders/MyScanner";
```

## Scanner Implementation Guidelines

### Scanning Best Practices

#### 1. Use Progress Callbacks

```typescript
async scan(options: ScanOptions): Promise<ScanItem[]> {
  const items: ScanItem[] = [];
  const paths = this.getPathsToScan();
  
  for (let i = 0; i < paths.length; i++) {
    if (options.cancelToken?.cancelled) break;
    
    // Scan path
    const foundItems = await this.scanPath(paths[i]);
    items.push(...foundItems);
    
    // Report progress
    if (options.onProgress) {
      options.onProgress((i + 1) / paths.length);
    }
  }
  
  return items;
}
```

#### 2. Handle Errors Gracefully

```typescript
try {
  const stats = await fs.stat(filePath);
  // ... use stats
} catch (error) {
  Logger.debug(this.id, `Skipping inaccessible file: ${filePath}`);
  // Continue scanning, don't throw
}
```

#### 3. Check Protected Paths

```typescript
import { PlatformPaths } from "../platform-adapters/paths";

if (PlatformPaths.isProtectedPath(path)) {
  continue; // Skip this path
}
```

#### 4. Check Whitelist

```typescript
import { WhitelistManager } from "../file-ops/whitelist";

if (await WhitelistManager.isWhitelisted(path)) {
  continue; // Skip whitelisted path
}
```

#### 5. Respect Cancel Tokens

```typescript
for (const item of items) {
  if (options.cancelToken?.cancelled) {
    break; // Stop scanning
  }
  // ... scan item
}
```

### Creating ScanItems

```typescript
const item: ScanItem = {
  id: `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  path: fullPath,
  sizeBytes: stats.size,
  discoveredAt: new Date().toISOString(),
  category: "my-category",
  reason: "Why this file should be removed",
  safeToDelete: true, // or false if user should review
  confidence: 0.9, // 0-1 scale
  metadata: {
    // Any additional data
    fileName: basename(fullPath),
    ageInDays: Math.floor(ageMs / (1000 * 60 * 60 * 24)),
  },
};
```

### Confidence Scores

Use these guidelines:

- **1.0**: 100% safe (e.g., trash bins)
- **0.9-0.95**: Very safe (e.g., system caches)
- **0.8-0.85**: Probably safe (e.g., old logs)
- **0.7-0.75**: Likely safe with review (e.g., old downloads)
- **0.5-0.6**: Needs user review (e.g., large files, mail)
- **<0.5**: High risk, extensive review needed

### Safety Levels

Mark items appropriately:

```typescript
safeToDelete: true   // Can be auto-selected for cleaning
safeToDelete: false  // User must manually select
```

## Platform-Specific Code

### Detecting OS

```typescript
import { platform } from "os";

const currentOS = platform(); // "darwin", "win32", "linux"
```

### OS-Specific Paths

```typescript
import { PlatformPaths } from "../platform-adapters/paths";

// Get trash paths for current OS
const trashPaths = PlatformPaths.getTrashPaths();

// Get cache paths
const cachePaths = PlatformPaths.getCachePaths();

// Get browser cache paths
const browserPaths = PlatformPaths.getBrowserCachePaths();

// Check if path is protected
if (PlatformPaths.isProtectedPath(somePath)) {
  // Don't scan this path
}
```

### OS-Specific Logic

```typescript
async scan(options: ScanOptions): Promise<ScanItem[]> {
  const items: ScanItem[] = [];
  
  switch (platform()) {
    case "darwin":
      items.push(...await this.scanMacOS());
      break;
    case "win32":
      items.push(...await this.scanWindows());
      break;
    case "linux":
      items.push(...await this.scanLinux());
      break;
  }
  
  return items;
}
```

## File Operations

### Safe Deletion

Always use `FileOperations.safeDelete`:

```typescript
import { FileOperations } from "../file-ops/operations";

const result = await FileOperations.safeDelete(paths, this.id, {
  dryRun: false,           // Set to true for preview
  quarantine: true,        // Recommend true for safety
  maxAge: 7,              // Optional: only delete files older than N days
});

console.log(`Deleted ${result.filesDeleted} files`);
console.log(`Freed ${result.spaceFreed} bytes`);
console.log(`Errors: ${result.errors.length}`);
```

### Calculating Directory Size

```typescript
import { FileOperations } from "../file-ops/operations";

const size = await FileOperations.getDirectorySize(dirPath);
console.log(`Directory is ${size} bytes`);
```

### Calculating Checksums

```typescript
import { FileOperations } from "../file-ops/operations";

const checksum = await FileOperations.calculateChecksum(filePath);
console.log(`SHA-256: ${checksum}`);
```

## Logging

### Log Levels

```typescript
import { Logger } from "../logger";

Logger.debug(this.id, "Detailed debug info", { extra: "data" });
Logger.info(this.id, "Normal operation", { count: 42 });
Logger.warn(this.id, "Something unexpected", { path: "/some/path" });
Logger.error(this.id, "Critical error", { error: errorMessage });
```

### When to Log

- **info**: Start/end of scan, major operations
- **debug**: File-level operations, skipped items
- **warn**: Unexpected situations, permission issues
- **error**: Critical failures, exceptions

## Performance Optimization

### Limit Recursion Depth

```typescript
async scanDirectory(path: string, depth: number = 0): Promise<ScanItem[]> {
  const maxDepth = 5;
  if (depth > maxDepth) {
    return [];
  }
  // ... scan logic
}
```

### Batch Operations

```typescript
// Instead of awaiting each file
for (const file of files) {
  await processFile(file); // Slow!
}

// Batch process
const results = await Promise.all(
  files.map(file => processFile(file))
);
```

### Stream Large Files

```typescript
// For large file operations, use streams
const fd = await fs.open(filePath, "r");
try {
  const buffer = Buffer.alloc(1024);
  await fd.read(buffer, 0, buffer.length, 0);
  // Process buffer
} finally {
  await fd.close();
}
```

## Testing

### Unit Test Structure

```typescript
import { MyScanner } from "./MyScanner";
import { expect } from "chai";

describe("MyScanner", () => {
  let scanner: MyScanner;
  
  beforeEach(() => {
    scanner = new MyScanner();
  });
  
  it("should have correct metadata", () => {
    expect(scanner.id).to.equal("my-scanner");
    expect(scanner.name).to.equal("My Scanner");
    expect(scanner.supportedOS).to.include("mac");
  });
  
  it("should scan and return items", async () => {
    const items = await scanner.scan({ dryRun: true });
    expect(items).to.be.an("array");
  });
  
  it("should respect cancel token", async () => {
    const cancelToken = { cancelled: false };
    setTimeout(() => cancelToken.cancelled = true, 100);
    
    const items = await scanner.scan({ 
      dryRun: true,
      cancelToken 
    });
    // Should stop early
  });
});
```

### Integration Test Example

```typescript
describe("MyScanner Integration", () => {
  it("should clean and quarantine files", async () => {
    // Setup: Create test files
    const testDir = "/tmp/test-scanner";
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(join(testDir, "test.txt"), "test");
    
    // Scan
    const scanner = new MyScanner();
    const items = await scanner.scan({ dryRun: true });
    
    // Clean with quarantine
    const result = await scanner.clean(items, {
      backup: true,
      quarantine: true,
    });
    
    // Verify
    expect(result.success).to.be.true;
    expect(result.itemsCleaned).to.be.greaterThan(0);
    
    // Cleanup
    await fs.rm(testDir, { recursive: true });
  });
});
```

## Common Patterns

### Finding Files by Pattern

```typescript
import { promises as fs } from "fs";
import { join } from "path";

async function findFilesByPattern(
  dir: string,
  pattern: RegExp
): Promise<string[]> {
  const matches: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isFile() && pattern.test(entry.name)) {
        matches.push(fullPath);
      } else if (entry.isDirectory()) {
        const subMatches = await findFilesByPattern(fullPath, pattern);
        matches.push(...subMatches);
      }
    }
  } catch (error) {
    // Directory not accessible
  }
  
  return matches;
}
```

### Filtering by Age

```typescript
async function findOldFiles(
  dir: string,
  maxAgeMs: number
): Promise<string[]> {
  const oldFiles: string[] = [];
  const cutoff = Date.now() - maxAgeMs;
  
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const stats = await fs.stat(fullPath);
    
    if (stats.mtime.getTime() < cutoff) {
      oldFiles.push(fullPath);
    }
  }
  
  return oldFiles;
}
```

### Grouping by Size

```typescript
function groupBySize(items: ScanItem[]): Map<string, ScanItem[]> {
  const groups = new Map<string, ScanItem[]>();
  
  for (const item of items) {
    const sizeMB = Math.floor(item.sizeBytes / (1024 * 1024));
    let category: string;
    
    if (sizeMB < 10) category = "small";
    else if (sizeMB < 100) category = "medium";
    else if (sizeMB < 1000) category = "large";
    else category = "huge";
    
    const group = groups.get(category) || [];
    group.push(item);
    groups.set(category, group);
  }
  
  return groups;
}
```

## Troubleshooting

### Scanner Not Found

Ensure:
1. Scanner is exported from `core/index.ts`
2. Scanner is registered in `scanners.ts`
3. Main process is rebuilt (`npm run build:main`)

### Permission Errors

- Check if path requires elevated permissions
- Use try-catch for file operations
- Log permission errors at debug level
- Continue scanning other files

### Performance Issues

- Limit recursion depth
- Add progress callbacks
- Use batch operations
- Implement cancellation
- Cache results when possible

### Platform-Specific Bugs

- Test on all platforms
- Use `PlatformPaths` for OS-specific paths
- Check platform with `platform()` before OS-specific code
- Handle missing directories gracefully

## Additional Resources

- [Scanner Architecture](./SCANNER_ARCHITECTURE.md)
- [QA Checklist](./QA_CHECKLIST.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js fs API](https://nodejs.org/api/fs.html)
- [Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-main)
