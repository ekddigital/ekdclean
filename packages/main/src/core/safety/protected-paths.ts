// EKD Clean - Protected Paths System
// Built by EKD Digital
//
// This module defines paths that should NEVER be deleted by EKD Clean
// to prevent system corruption and data loss.

import { platform } from "os";
import { homedir } from "os";
import { join } from "path";

export type ProtectedPathCategory =
  | "system"
  | "user-data"
  | "applications"
  | "database"
  | "security";

export type ProtectedPath = {
  path: string;
  category: ProtectedPathCategory;
  reason: string;
  patterns?: string[]; // Glob patterns for matching
};

/**
 * Get protected paths for the current operating system
 */
export function getProtectedPaths(): ProtectedPath[] {
  const os = platform();
  const home = homedir();

  const commonPaths: ProtectedPath[] = [
    // User Documents and Important Folders
    {
      path: join(home, "Documents"),
      category: "user-data",
      reason: "User-created documents",
      patterns: [`${home}/Documents/**`],
    },
    {
      path: join(home, "Desktop"),
      category: "user-data",
      reason: "User desktop files",
      patterns: [`${home}/Desktop/**`],
    },
    {
      path: join(home, "Pictures"),
      category: "user-data",
      reason: "User photos and images",
      patterns: [`${home}/Pictures/**`],
    },
    {
      path: join(home, "Music"),
      category: "user-data",
      reason: "User music library",
      patterns: [`${home}/Music/**`],
    },
    {
      path: join(home, "Videos"),
      category: "user-data",
      reason: "User video library",
      patterns: [`${home}/Videos/**`],
    },
  ];

  if (os === "darwin") {
    return [...commonPaths, ...getMacOSProtectedPaths(home)];
  } else if (os === "win32") {
    return [...commonPaths, ...getWindowsProtectedPaths()];
  } else {
    return [...commonPaths, ...getLinuxProtectedPaths(home)];
  }
}

/**
 * macOS-specific protected paths
 */
function getMacOSProtectedPaths(home: string): ProtectedPath[] {
  return [
    // System Directories
    {
      path: "/System",
      category: "system",
      reason: "macOS system files",
      patterns: ["/System/**"],
    },
    {
      path: "/Library/System",
      category: "system",
      reason: "System library files",
      patterns: ["/Library/System/**"],
    },
    {
      path: "/usr/bin",
      category: "system",
      reason: "System binaries",
      patterns: ["/usr/bin/**"],
    },
    {
      path: "/usr/sbin",
      category: "system",
      reason: "System administrator binaries",
      patterns: ["/usr/sbin/**"],
    },
    {
      path: "/sbin",
      category: "system",
      reason: "System binaries",
      patterns: ["/sbin/**"],
    },
    {
      path: "/bin",
      category: "system",
      reason: "Essential system binaries",
      patterns: ["/bin/**"],
    },

    // User Application Support
    {
      path: join(home, "Library/Application Support/Apple"),
      category: "system",
      reason: "Apple application data",
      patterns: [`${home}/Library/Application Support/Apple/**`],
    },

    // Database-backed Applications
    {
      path: join(home, "Library/Mail"),
      category: "database",
      reason: "Mail database and attachments",
      patterns: [
        `${home}/Library/Mail/**/Envelope Index*`,
        `${home}/Library/Mail/**/*.mbox`,
      ],
    },
    {
      path: join(home, "Library/Messages"),
      category: "database",
      reason: "Messages database",
      patterns: [`${home}/Library/Messages/chat.db*`],
    },
    {
      path: join(home, "Pictures/Photos Library.photoslibrary"),
      category: "database",
      reason: "Photos library database",
      patterns: [`${home}/Pictures/*.photoslibrary/**`],
    },

    // Security and Keychain
    {
      path: join(home, "Library/Keychains"),
      category: "security",
      reason: "User keychain (passwords, certificates)",
      patterns: [`${home}/Library/Keychains/**`],
    },

    // Time Machine
    {
      path: "/.Snapshots",
      category: "system",
      reason: "APFS snapshots",
      patterns: ["/.Snapshots/**"],
    },
  ];
}

/**
 * Windows-specific protected paths
 */
function getWindowsProtectedPaths(): ProtectedPath[] {
  return [
    // System Directories
    {
      path: "C:\\Windows",
      category: "system",
      reason: "Windows system files",
      patterns: ["C:/Windows/**"],
    },
    {
      path: "C:\\Windows\\System32",
      category: "system",
      reason: "Critical system files",
      patterns: ["C:/Windows/System32/**"],
    },
    {
      path: "C:\\Windows\\SysWOW64",
      category: "system",
      reason: "32-bit system files on 64-bit Windows",
      patterns: ["C:/Windows/SysWOW64/**"],
    },
    {
      path: "C:\\Program Files",
      category: "applications",
      reason: "Installed applications",
      patterns: ["C:/Program Files/**/*.exe", "C:/Program Files/**/*.dll"],
    },
    {
      path: "C:\\Program Files (x86)",
      category: "applications",
      reason: "32-bit applications",
      patterns: [
        "C:/Program Files (x86)/**/*.exe",
        "C:/Program Files (x86)/**/*.dll",
      ],
    },

    // User Profile Critical Folders
    {
      path: join(homedir(), "AppData\\Local\\Microsoft\\Credentials"),
      category: "security",
      reason: "Windows credentials",
      patterns: [`${homedir()}/AppData/Local/Microsoft/Credentials/**`],
    },
    {
      path: join(homedir(), "AppData\\Roaming\\Microsoft\\Protect"),
      category: "security",
      reason: "DPAPI protected data",
      patterns: [`${homedir()}/AppData/Roaming/Microsoft/Protect/**`],
    },

    // System Recovery
    {
      path: "C:\\System Volume Information",
      category: "system",
      reason: "System restore points",
      patterns: ["C:/System Volume Information/**"],
    },
  ];
}

/**
 * Linux-specific protected paths
 */
function getLinuxProtectedPaths(home: string): ProtectedPath[] {
  return [
    // System Directories
    {
      path: "/bin",
      category: "system",
      reason: "Essential binaries",
      patterns: ["/bin/**"],
    },
    {
      path: "/sbin",
      category: "system",
      reason: "System binaries",
      patterns: ["/sbin/**"],
    },
    {
      path: "/usr/bin",
      category: "system",
      reason: "User binaries",
      patterns: ["/usr/bin/**"],
    },
    {
      path: "/usr/sbin",
      category: "system",
      reason: "System administrator binaries",
      patterns: ["/usr/sbin/**"],
    },
    {
      path: "/lib",
      category: "system",
      reason: "System libraries",
      patterns: ["/lib/**"],
    },
    {
      path: "/usr/lib",
      category: "system",
      reason: "System libraries",
      patterns: ["/usr/lib/**"],
    },
    {
      path: "/etc",
      category: "system",
      reason: "System configuration files",
      patterns: ["/etc/**"],
    },
    {
      path: "/boot",
      category: "system",
      reason: "Boot files and kernel",
      patterns: ["/boot/**"],
    },

    // User Configuration
    {
      path: join(home, ".ssh"),
      category: "security",
      reason: "SSH keys and configuration",
      patterns: [`${home}/.ssh/**`],
    },
    {
      path: join(home, ".gnupg"),
      category: "security",
      reason: "GPG keys",
      patterns: [`${home}/.gnupg/**`],
    },

    // System Services
    {
      path: "/etc/systemd",
      category: "system",
      reason: "systemd configuration",
      patterns: ["/etc/systemd/**"],
    },
    {
      path: "/usr/lib/systemd",
      category: "system",
      reason: "systemd units",
      patterns: ["/usr/lib/systemd/**"],
    },
  ];
}

/**
 * Check if a path is protected
 */
export function isProtectedPath(filePath: string): boolean {
  const protectedPaths = getProtectedPaths();

  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, "/");

  for (const protectedItem of protectedPaths) {
    const normalizedProtectedPath = protectedItem.path.replace(/\\/g, "/");

    // Check exact match
    if (normalizedPath === normalizedProtectedPath) {
      return true;
    }

    // Check if path starts with protected path (is inside protected directory)
    if (normalizedPath.startsWith(normalizedProtectedPath + "/")) {
      return true;
    }

    // Check patterns if defined
    if (protectedItem.patterns) {
      for (const pattern of protectedItem.patterns) {
        const normalizedPattern = pattern.replace(/\\/g, "/");
        // Simple glob matching (** means any depth, * means any character in segment)
        const regexPattern = normalizedPattern
          .replace(/\*\*/g, ".*")
          .replace(/\*/g, "[^/]*")
          .replace(/\//g, "\\/");

        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(normalizedPath)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get the reason why a path is protected
 */
export function getProtectionReason(filePath: string): string | null {
  const protectedPaths = getProtectedPaths();
  const normalizedPath = filePath.replace(/\\/g, "/");

  for (const protectedItem of protectedPaths) {
    const normalizedProtectedPath = protectedItem.path.replace(/\\/g, "/");

    if (
      normalizedPath === normalizedProtectedPath ||
      normalizedPath.startsWith(normalizedProtectedPath + "/")
    ) {
      return protectedItem.reason;
    }

    if (protectedItem.patterns) {
      for (const pattern of protectedItem.patterns) {
        const normalizedPattern = pattern.replace(/\\/g, "/");
        const regexPattern = normalizedPattern
          .replace(/\*\*/g, ".*")
          .replace(/\*/g, "[^/]*")
          .replace(/\//g, "\\/");

        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(normalizedPath)) {
          return protectedItem.reason;
        }
      }
    }
  }

  return null;
}

/**
 * Filter out protected paths from a list of paths
 */
export function filterProtectedPaths(paths: string[]): {
  safe: string[];
  protectedPaths: Array<{ path: string; reason: string }>;
} {
  const safe: string[] = [];
  const protectedItems: Array<{ path: string; reason: string }> = [];

  for (const path of paths) {
    if (isProtectedPath(path)) {
      const reason = getProtectionReason(path) || "Protected system file";
      protectedItems.push({ path, reason });
    } else {
      safe.push(path);
    }
  }

  return { safe, protectedPaths: protectedItems };
}
