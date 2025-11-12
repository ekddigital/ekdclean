// EKD Clean - Smart Cache Discovery System
// Built by EKD Digital
// Automatically discovers cache directories instead of hardcoding paths

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { Logger } from "../logger";

interface CachePattern {
  pattern: RegExp;
  category: string;
  safeToDelete: boolean;
  confidence: number;
  description: string;
}

interface DiscoveredCache {
  path: string;
  category: string;
  safeToDelete: boolean;
  confidence: number;
  sizeBytes: number;
  description: string;
  matched: string; // Which pattern matched
}

export class SmartCacheDiscovery {
  private static readonly CACHE_PATTERNS: CachePattern[] = [
    // Browser caches (very safe)
    {
      pattern: /\/Cache$/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Browser cache",
    },
    {
      pattern: /\/CacheStorage$/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Browser storage cache",
    },
    {
      pattern: /\/GPUCache$/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "GPU cache",
    },
    {
      pattern: /\/Service Worker\/CacheStorage/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Service worker cache",
    },

    // Development tool caches (safe)
    {
      pattern: /\/_cacache$/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "NPM cache",
    },
    {
      pattern: /\/\.cache\//i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Development cache",
    },
    {
      pattern: /\/node_modules\/\.cache/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Node modules cache",
    },
    {
      pattern: /\/DerivedData\//i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.85,
      description: "Xcode derived data",
    },
    {
      pattern: /\/Homebrew\/downloads/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Homebrew downloads",
    },

    // Application caches (safe)
    {
      pattern: /\/PersistentCache$/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Application cache",
    },
    {
      pattern: /\/MediaCache/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Media cache",
    },
    {
      pattern: /\/ThumbnailCache/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Thumbnail cache",
    },

    // Logs (safe, but lower confidence)
    {
      pattern: /\/Logs$/i,
      category: "logs",
      safeToDelete: true,
      confidence: 0.85,
      description: "Application logs",
    },

    // Add MANY more aggressive patterns for better discovery
    {
      pattern: /\/tmp$/i,
      category: "temp",
      safeToDelete: true,
      confidence: 0.95,
      description: "Temporary files",
    },
    {
      pattern: /\/temp$/i,
      category: "temp",
      safeToDelete: true,
      confidence: 0.95,
      description: "Temporary files",
    },
    {
      pattern: /\/.*\.tmp$/i,
      category: "temp",
      safeToDelete: true,
      confidence: 0.9,
      description: "Temporary files",
    },
    {
      pattern: /\/Saved Application State/i,
      category: "app-state",
      safeToDelete: true,
      confidence: 0.85,
      description: "Application state cache",
    },
    {
      pattern: /\/WebKitCache/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "WebKit cache",
    },
    {
      pattern: /\/Safari\/.*Cache/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Safari cache",
    },
    {
      pattern: /\/com\.apple\.Safari/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Safari data cache",
    },
    {
      pattern: /\/Chrome.*\/Default\/Cache/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Chrome cache",
    },
    {
      pattern: /\/Firefox.*\/cache2/i,
      category: "browser-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Firefox cache",
    },
    {
      pattern: /\/Microsoft.*Cache/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Microsoft app cache",
    },
    {
      pattern: /\/Adobe.*Cache/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Adobe cache",
    },
    {
      pattern: /\/Spotify.*Cache/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Spotify cache",
    },
    {
      pattern: /\/Slack.*Cache/i,
      category: "app-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Slack cache",
    },
    {
      pattern: /\/com\.docker/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.85,
      description: "Docker cache",
    },
    {
      pattern: /\/\.gradle\/caches/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Gradle cache",
    },
    {
      pattern: /\/\.m2\/repository/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.8,
      description: "Maven repository",
    },
    {
      pattern: /\/npm-cache/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "NPM cache",
    },
    {
      pattern: /\/yarn-cache/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.95,
      description: "Yarn cache",
    },
    {
      pattern: /\/pip\/cache/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.9,
      description: "Python pip cache",
    },
    {
      pattern: /\/conda\/pkgs/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.85,
      description: "Conda packages",
    },
    {
      pattern: /\/\.cargo\/registry/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.8,
      description: "Rust cargo cache",
    },
    {
      pattern: /\/go\/pkg\/mod/i,
      category: "dev-cache",
      safeToDelete: true,
      confidence: 0.8,
      description: "Go modules cache",
    },
    {
      pattern: /\/Library\/Containers\/.*\/Data$/i,
      category: "app-data",
      safeToDelete: false,
      confidence: 0.6,
      description: "App container data (review carefully)",
    },
    {
      pattern: /\.log$/i,
      category: "logs",
      safeToDelete: true,
      confidence: 0.85,
      description: "Log files",
    },

    // Temp files (very safe)
    {
      pattern: /\/Temp$/i,
      category: "temp",
      safeToDelete: true,
      confidence: 0.95,
      description: "Temporary files",
    },
    {
      pattern: /\/tmp\//i,
      category: "temp",
      safeToDelete: true,
      confidence: 0.95,
      description: "Temporary files",
    },

    // Crash reports (safe)
    {
      pattern: /\/CrashReporter$/i,
      category: "crash-reports",
      safeToDelete: true,
      confidence: 0.9,
      description: "Crash reports",
    },
    {
      pattern: /\/DiagnosticReports$/i,
      category: "crash-reports",
      safeToDelete: true,
      confidence: 0.9,
      description: "Diagnostic reports",
    },
  ];

  /**
   * Discover all cache directories dynamically by scanning common locations
   */
  static async discoverCaches(
    minSizeMB: number = 1
  ): Promise<DiscoveredCache[]> {
    const home = homedir();
    const discoveries: DiscoveredCache[] = [];

    // Scan root directories where caches typically live
    const scanRoots = [
      // User Library locations
      join(home, "Library/Caches"),
      join(home, "Library/Application Support"),
      join(home, "Library/Logs"),
      join(home, "Library/Developer"),
      join(home, "Library/WebKit"),
      join(home, "Library/Safari"),
      join(home, "Library/Containers"),
      join(home, "Library/Group Containers"),
      join(home, "Library/Saved Application State"),

      // Development tool caches
      join(home, ".cache"),
      join(home, ".npm"),
      join(home, ".yarn"),
      join(home, ".gradle"),
      join(home, ".m2"),
      join(home, ".vscode"),
      join(home, ".config"),
      join(home, ".local/share"),
      join(home, "node_modules"),

      // Homebrew and package managers
      "/opt/homebrew/var/cache",
      "/usr/local/var/cache",
      "/private/var/folders", // System temp with permissions

      // System locations (require Full Disk Access)
      "/System/Library/Caches",
      "/Library/Caches",
      "/var/folders",
      "/private/tmp",
      "/var/tmp",
    ];

    for (const root of scanRoots) {
      if (!existsSync(root)) continue;

      try {
        const found = await this.scanForCaches(root, minSizeMB, 0, 3);
        discoveries.push(...found);
      } catch (error) {
        Logger.debug("SmartCacheDiscovery", `Failed to scan: ${root}`);
      }
    }

    return discoveries;
  }

  /**
   * Recursively scan for cache directories
   */
  private static async scanForCaches(
    dirPath: string,
    minSizeMB: number,
    depth: number,
    maxDepth: number
  ): Promise<DiscoveredCache[]> {
    const discoveries: DiscoveredCache[] = [];

    if (depth > maxDepth) return discoveries;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const fullPath = join(dirPath, entry.name);

        // Check if this directory matches any cache pattern
        const match = this.matchCachePattern(fullPath);

        if (match) {
          try {
            const size = await this.getDirectorySize(fullPath);
            const sizeMB = size / (1024 * 1024);

            if (sizeMB >= minSizeMB) {
              discoveries.push({
                path: fullPath,
                category: match.category,
                safeToDelete: match.safeToDelete,
                confidence: match.confidence,
                sizeBytes: size,
                description: match.description,
                matched: match.pattern.source,
              });
            } else if (sizeMB > 0.01 && match.confidence >= 0.9) {
              // Include very confident small caches (>10KB) as they add up
              discoveries.push({
                path: fullPath,
                category: match.category,
                safeToDelete: match.safeToDelete,
                confidence: match.confidence * 0.8, // Lower confidence for small files
                sizeBytes: size,
                description: `${match.description} (small cache)`,
                matched: match.pattern.source,
              });
            }
          } catch (error) {
            Logger.debug(
              "SmartCacheDiscovery",
              `Failed to get size: ${fullPath}`
            );
          }
        }

        // Continue scanning subdirectories
        if (depth < maxDepth) {
          const subDiscoveries = await this.scanForCaches(
            fullPath,
            minSizeMB,
            depth + 1,
            maxDepth
          );
          discoveries.push(...subDiscoveries);
        }
      }
    } catch (error) {
      Logger.debug(
        "SmartCacheDiscovery",
        `Failed to scan directory: ${dirPath}`
      );
    }

    return discoveries;
  }

  /**
   * Match a path against cache patterns
   */
  private static matchCachePattern(path: string): CachePattern | null {
    for (const pattern of this.CACHE_PATTERNS) {
      if (pattern.pattern.test(path)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Get directory size efficiently
   */
  private static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    const maxFiles = 1000; // Limit for performance
    let fileCount = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (fileCount >= maxFiles) break;

        const fullPath = join(dirPath, entry.name);

        try {
          if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
          } else if (entry.isDirectory()) {
            const subSize = await this.getDirectorySize(fullPath);
            totalSize += subSize;
          }
        } catch (error) {
          // Skip inaccessible files
        }
      }
    } catch (error) {
      // Directory not accessible
    }

    return totalSize;
  }

  /**
   * Check if a path is in user's exclusion list
   */
  static isExcluded(path: string, exclusions: string[]): boolean {
    return exclusions.some((exclusion) => path.includes(exclusion));
  }

  /**
   * Categorize discoveries for better UI organization
   */
  static categorizeCaches(
    discoveries: DiscoveredCache[]
  ): Map<string, DiscoveredCache[]> {
    const categorized = new Map<string, DiscoveredCache[]>();

    for (const discovery of discoveries) {
      const existing = categorized.get(discovery.category) || [];
      existing.push(discovery);
      categorized.set(discovery.category, existing);
    }

    return categorized;
  }

  /**
   * Get total size by category
   */
  static getCategorySizes(discoveries: DiscoveredCache[]): Map<string, number> {
    const sizes = new Map<string, number>();

    for (const discovery of discoveries) {
      const current = sizes.get(discovery.category) || 0;
      sizes.set(discovery.category, current + discovery.sizeBytes);
    }

    return sizes;
  }
}
