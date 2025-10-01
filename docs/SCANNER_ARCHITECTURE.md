# EKD Clean - Scanner Architecture

**Built by EKD Digital - Superior to CleanMyMac**

## Overview

EKD Clean implements a modular, type-safe scanning system with safety-first principles. The architecture is designed to be:

- **Modular**: Each scanner is independent and implements a common interface
- **Type-Safe**: Full TypeScript with strict mode enabled
- **Cross-Platform**: Supports macOS, Windows, and Linux
- **Safe**: Multiple safety layers including quarantine, whitelist, and protected paths
- **Testable**: Clean separation of concerns enables comprehensive testing

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                 Renderer Process                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  UI Components (React + TypeScript)           │  │
│  │  - QuarantineView                             │  │
│  │  - EnhancedScannerView                        │  │
│  │  - SettingsView                               │  │
│  └──────────────────────────────────────────────┘  │
│                       │                              │
│                   IPC Bridge                         │
│                       │                              │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│                 Main Process                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  Scanner Registry                             │  │
│  │  - Manages all scanner instances              │  │
│  │  - Provides scanner discovery                 │  │
│  └──────────────────────────────────────────────┘  │
│                       │                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Scanners (IScanner interface)                │  │
│  │  - SystemJunkScanner                          │  │
│  │  - TrashBinsScanner                           │  │
│  │  - LargeOldFilesScanner                       │  │
│  │  - PhotoJunkScanner                           │  │
│  │  - MailAttachmentsScanner                     │  │
│  │  - PrivacyScanner                             │  │
│  └──────────────────────────────────────────────┘  │
│                       │                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  File Operations                              │  │
│  │  - Quarantine Manager                         │  │
│  │  - Whitelist Manager                          │  │
│  │  - Safe Delete Operations                     │  │
│  └──────────────────────────────────────────────┘  │
│                       │                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Platform Adapters                            │  │
│  │  - OS-specific path resolution                │  │
│  │  - Protected path detection                   │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Core Components

### IScanner Interface

All scanners implement the `IScanner` interface:

```typescript
interface IScanner {
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
```

### ScanItem Type

Each discovered item is represented as:

```typescript
type ScanItem = {
  id: string;              // Unique identifier
  path: string;            // Full file path
  sizeBytes: number;       // File size in bytes
  discoveredAt: string;    // ISO timestamp
  category: string;        // Scanner category
  reason: string;          // Human-readable explanation
  safeToDelete: boolean;   // Safety flag
  confidence: number;      // 0-1 confidence score
  metadata?: Record<string, any>;  // Additional data
};
```

## Scanner Modules

### 1. SystemJunkScanner

**Purpose**: Clean system caches, temp files, and application junk

**Categories Scanned**:
- Application caches (>10MB)
- System temporary files (>24 hours old)
- Development artifacts (npm, yarn, pip, Homebrew, Xcode)

**Safety Level**: High (confidence 0.85-0.95)

**Implementation**: `packages/main/src/core/finders/SystemJunkScanner.ts`

### 2. TrashBinsScanner

**Purpose**: Empty trash bins across all OS locations

**Categories Scanned**:
- macOS: `~/.Trash`, `/.Trashes`
- Windows: `C:\$Recycle.Bin`
- Linux: `~/.local/share/Trash`

**Safety Level**: Very High (confidence 1.0)

**Implementation**: `packages/main/src/core/finders/TrashBinsScanner.ts`

### 3. LargeOldFilesScanner

**Purpose**: Find large files not accessed recently

**Configuration**:
- Min size: 100MB (configurable)
- Min age: 90 days (configurable)
- Search paths: Downloads, Documents (configurable)

**Safety Level**: Medium (confidence 0.6, requires user review)

**Implementation**: `packages/main/src/core/finders/LargeOldFilesScanner.ts`

### 4. PhotoJunkScanner

**Purpose**: Find duplicate photos, thumbnails, and photo cache

**Features**:
- Duplicate detection using quick hash (size + first/last 1KB)
- Thumbnail detection by filename patterns
- Photo app cache detection

**Safety Level**: Medium-High (0.8-0.9 for caches, 0.8 for duplicates)

**Implementation**: `packages/main/src/core/finders/PhotoJunkScanner.ts`

### 5. MailAttachmentsScanner

**Purpose**: Clean cached mail attachments

**Supports**:
- Apple Mail (macOS)
- Microsoft Outlook (macOS/Windows)
- Mozilla Thunderbird (all platforms)

**Safety Level**: Low (confidence 0.5, requires user review)

**Implementation**: `packages/main/src/core/finders/MailAttachmentsScanner.ts`

### 6. PrivacyScanner

**Purpose**: Clean browser data and privacy traces

**Categories**:
- Browser caches (Chrome, Safari, Firefox, Edge)
- Browser history and cookies
- Application logs (>7 days old)
- Recent files lists

**Safety Level**: High for caches (0.95), Medium for history (0.7)

**Implementation**: `packages/main/src/core/finders/PrivacyScanner.ts`

## Safety Features

### 1. Quarantine System

Located at: `~/.ekdclean/quarantine/`

**Features**:
- Files are copied before deletion
- SHA-256 checksum verification
- Metadata tracking (original path, size, timestamp)
- One-click restore functionality
- Automatic cleanup of old quarantine items

**Implementation**: `packages/main/src/core/file-ops/quarantine.ts`

### 2. Whitelist System

Located at: `~/.ekdclean/whitelist.json`

**Rule Types**:
- **Path**: Exact path matching
- **Glob**: Pattern matching (e.g., `**/*.important`)
- **Hash**: File hash matching (SHA-256)

**Implementation**: `packages/main/src/core/file-ops/whitelist.ts`

### 3. Protected Paths

Built-in protection for:
- System directories (`/System`, `/Windows/System32`, etc.)
- User documents (`~/Documents`, `~/Desktop`, etc.)
- User media (`~/Pictures`, `~/Music`, `~/Movies`, etc.)

**Implementation**: `packages/main/src/core/platform-adapters/paths.ts`

### 4. Dry-Run Mode

All scanners support dry-run mode (default):
- No files are actually deleted
- Returns what would be deleted
- Allows preview before actual operation

## Logging

All operations are logged to: `~/.ekdclean/logs/ekdclean.log`

**Log Levels**:
- `debug`: Detailed operation information
- `info`: Normal operations
- `warn`: Non-critical issues
- `error`: Critical failures

**Features**:
- Automatic log rotation at 10MB
- JSON format for easy parsing
- Structured logging with metadata

**Implementation**: `packages/main/src/core/logger.ts`

## IPC Communication

### Available Handlers

```typescript
// Scanner Operations
"get-scanners"              // Get all available scanners
"run-smart-scan"            // Run all scanners
"run-scanner"               // Run specific scanner
"clean-items"               // Clean selected items

// Quarantine Management
"get-quarantine-items"      // List quarantined files
"restore-quarantine-item"   // Restore specific file
"clear-quarantine"          // Clear old quarantine items

// Whitelist Management
"get-whitelist-rules"       // List all rules
"add-whitelist-rule"        // Add new rule
"remove-whitelist-rule"     // Remove rule
```

### Progress Events

```typescript
"scan-progress"             // Overall scan progress
"scanner-progress"          // Individual scanner progress
"clean-progress"            // Cleaning operation progress
```

## Best Practices

### For Scanner Implementation

1. **Always check file existence** before operations
2. **Handle errors gracefully** - log and continue
3. **Respect cancel tokens** for long operations
4. **Provide progress updates** for better UX
5. **Use confidence scores** to indicate safety
6. **Include detailed reasons** for user clarity

### For UI Integration

1. **Always quarantine by default** for safety
2. **Show confidence indicators** to users
3. **Provide undo/restore** functionality
4. **Confirm destructive operations** explicitly
5. **Display file paths** for transparency

### For Testing

1. **Use fake file systems** for unit tests
2. **Test dry-run mode** thoroughly
3. **Verify quarantine operations** with checksums
4. **Test cross-platform** behavior
5. **Mock IPC handlers** in renderer tests

## Performance Considerations

- **Limit recursion depth** to prevent stack overflow
- **Use streaming operations** for large directories
- **Batch file operations** to reduce overhead
- **Cache scan results** when appropriate
- **Implement cancellation** for long operations

## Security Considerations

- **Never delete without user confirmation**
- **Validate all paths** before operations
- **Check permissions** before file access
- **Sanitize user input** in whitelist rules
- **Use checksums** to verify file integrity

## Future Enhancements

- [ ] Add Speed scanner (startup items, background services)
- [ ] Implement SQLite storage for better performance
- [ ] Add compression to quarantine
- [ ] Support for cloud storage cleanup
- [ ] Machine learning for smarter duplicate detection
- [ ] Network drive scanning support
- [ ] Scheduled scans and automation
- [ ] Export scan reports (PDF/CSV)

## Related Documentation

- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
- [CleanMyMac Style Reference](./CleanMyMac-Style-Reference.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
