// EKD Clean - Diagnostic Scanner for Permission Testing
// Built by EKD Digital - Checks what directories we can actually access

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export class DiagnosticScanner {
  static async testDirectoryAccess(): Promise<void> {
    const home = homedir();

    const testPaths = [
      // User locations
      join(home, "Library/Caches"),
      join(home, "Library/Application Support"),
      join(home, "Library/Safari"),
      join(home, "Library/WebKit"),
      join(home, "Library/Containers"),
      join(home, "Library/Logs"),

      // System locations (require Full Disk Access)
      "/System/Library/Caches",
      "/Library/Caches",
      "/private/var/folders",
      "/var/folders",
      "/private/tmp",
      "/var/tmp",

      // Development tools
      join(home, ".cache"),
      join(home, ".npm"),
      join(home, ".gradle"),
      "/opt/homebrew/var/cache",
      "/usr/local/var/cache",
    ];

    console.log("🔍 EKD Clean - Directory Access Test");
    console.log("=====================================");

    for (const path of testPaths) {
      try {
        if (existsSync(path)) {
          const stats = await fs.stat(path);
          if (stats.isDirectory()) {
            try {
              const files = await fs.readdir(path);
              console.log(`✅ ${path} - ${files.length} entries`);
            } catch (error) {
              console.log(
                `❌ ${path} - EXISTS but permission denied: ${(error as Error).message}`
              );
            }
          } else {
            console.log(`⚠️  ${path} - Not a directory`);
          }
        } else {
          console.log(`❓ ${path} - Does not exist`);
        }
      } catch (error) {
        console.log(`❌ ${path} - Error: ${(error as Error).message}`);
      }
    }

    console.log("\n📊 Summary:");
    console.log(
      "✅ = Can access   ❌ = Permission denied   ❓ = Does not exist"
    );
    console.log(
      "\nIf you see many ❌ symbols, you need to enable Full Disk Access:"
    );
    console.log(
      "System Preferences → Privacy & Security → Full Disk Access → Add EKD Clean"
    );
  }

  static async calculateDirectorySize(
    dirPath: string
  ): Promise<{ sizeMB: number; fileCount: number }> {
    let totalSize = 0;
    let fileCount = 0;

    try {
      const files = await fs.readdir(dirPath);

      for (const file of files.slice(0, 100)) {
        // Limit to first 100 for speed
        try {
          const filePath = join(dirPath, file);
          const stats = await fs.stat(filePath);

          if (stats.isFile()) {
            totalSize += stats.size;
            fileCount++;
          }
        } catch (error) {
          // Skip files we can't access
        }
      }
    } catch (error) {
      // Can't access directory
    }

    return {
      sizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      fileCount,
    };
  }

  static async findLargestCaches(): Promise<void> {
    const home = homedir();

    const cachePaths = [
      join(home, "Library/Caches"),
      join(home, "Library/Application Support"),
      join(home, "Library/Safari"),
      join(home, "Library/WebKit"),
      join(home, ".cache"),
      join(home, ".npm"),
      join(home, ".gradle"),
      "/System/Library/Caches",
      "/Library/Caches",
    ];

    console.log("\n🗂️ Cache Directory Sizes");
    console.log("========================");

    const results: Array<{ path: string; sizeMB: number; fileCount: number }> =
      [];

    for (const path of cachePaths) {
      if (existsSync(path)) {
        const size = await this.calculateDirectorySize(path);
        results.push({ path, ...size });
      }
    }

    // Sort by size, largest first
    results.sort((a, b) => b.sizeMB - a.sizeMB);

    results.forEach((result) => {
      if (result.sizeMB > 0.1) {
        // Only show directories > 0.1 MB
        console.log(`📁 ${result.path}`);
        console.log(`   Size: ${result.sizeMB} MB, Files: ${result.fileCount}`);
      }
    });

    const totalMB = results.reduce((sum, r) => sum + r.sizeMB, 0);
    console.log(`\n💾 Total discoverable cache size: ${totalMB.toFixed(1)} MB`);
    console.log(
      "Note: This is a quick scan - actual scanner finds much more detail"
    );
  }
}
