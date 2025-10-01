// EKD Clean - Platform-Specific Path Helpers
// Built by EKD Digital

import { platform, homedir, tmpdir } from "os";
import { join } from "path";

export type OSPlatform = "darwin" | "win32" | "linux";

export class PlatformPaths {
  private static get platform(): OSPlatform {
    return platform() as OSPlatform;
  }

  static getTrashPaths(): string[] {
    const home = homedir();
    
    switch (this.platform) {
      case "darwin":
        return [
          join(home, ".Trash"),
          // Volume-specific trash
          "/.Trashes",
        ];
      
      case "win32":
        // Windows Recycle Bin (requires special handling)
        return [
          "C:\\$Recycle.Bin",
        ];
      
      case "linux":
        return [
          join(home, ".local/share/Trash"),
        ];
      
      default:
        return [];
    }
  }

  static getCachePaths(): string[] {
    const home = homedir();
    const temp = tmpdir();
    
    switch (this.platform) {
      case "darwin":
        return [
          join(home, "Library/Caches"),
          temp,
          "/private/tmp",
        ];
      
      case "win32":
        return [
          join(home, "AppData/Local/Temp"),
          process.env.TEMP || "",
          process.env.TMP || "",
        ].filter(Boolean);
      
      case "linux":
        return [
          join(home, ".cache"),
          temp,
          "/tmp",
        ];
      
      default:
        return [temp];
    }
  }

  static getBrowserCachePaths(): string[] {
    const home = homedir();
    
    switch (this.platform) {
      case "darwin":
        return [
          join(home, "Library/Caches/Google/Chrome"),
          join(home, "Library/Caches/com.apple.Safari"),
          join(home, "Library/Safari/LocalStorage"),
          join(home, "Library/Application Support/Firefox/Profiles"),
        ];
      
      case "win32":
        return [
          join(home, "AppData/Local/Google/Chrome/User Data"),
          join(home, "AppData/Local/Microsoft/Edge/User Data"),
          join(home, "AppData/Roaming/Mozilla/Firefox/Profiles"),
        ];
      
      case "linux":
        return [
          join(home, ".cache/google-chrome"),
          join(home, ".cache/mozilla/firefox"),
          join(home, ".config/google-chrome"),
        ];
      
      default:
        return [];
    }
  }

  static getLogPaths(): string[] {
    const home = homedir();
    
    switch (this.platform) {
      case "darwin":
        return [
          join(home, "Library/Logs"),
          "/var/log",
        ];
      
      case "win32":
        return [
          join(home, "AppData/Local/Logs"),
          "C:\\Windows\\Logs",
        ];
      
      case "linux":
        return [
          join(home, ".local/share/logs"),
          "/var/log",
        ];
      
      default:
        return [];
    }
  }

  static getProtectedPaths(): string[] {
    const home = homedir();
    
    switch (this.platform) {
      case "darwin":
        return [
          "/System",
          "/Library/System",
          "/private/var/db",
          join(home, "Documents"),
          join(home, "Desktop"),
          join(home, "Pictures"),
          join(home, "Music"),
          join(home, "Movies"),
          join(home, "Downloads"),
        ];
      
      case "win32":
        return [
          "C:\\Windows\\System32",
          "C:\\Windows\\SysWOW64",
          "C:\\Program Files",
          "C:\\Program Files (x86)",
          join(home, "Documents"),
          join(home, "Desktop"),
          join(home, "Pictures"),
          join(home, "Music"),
          join(home, "Videos"),
          join(home, "Downloads"),
        ];
      
      case "linux":
        return [
          "/bin",
          "/sbin",
          "/usr/bin",
          "/usr/sbin",
          "/lib",
          "/usr/lib",
          "/etc",
          "/boot",
          join(home, "Documents"),
          join(home, "Desktop"),
          join(home, "Pictures"),
          join(home, "Music"),
          join(home, "Videos"),
          join(home, "Downloads"),
        ];
      
      default:
        return [];
    }
  }

  static isProtectedPath(path: string): boolean {
    const protectedPaths = this.getProtectedPaths();
    return protectedPaths.some(protected_ => 
      path.startsWith(protected_) || path === protected_
    );
  }
}
