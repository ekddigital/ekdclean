// EKD Clean - Speed Scanner
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir, platform } from "os";
import { BaseScanner } from "../scanner-core/BaseScanner";
import {
  ScanItem,
  ScanOptions,
  CleanResult,
  SupportedOS,
} from "../scanner-core/types";
import { Logger } from "../logger";

export type StartupItem = {
  name: string;
  path: string;
  enabled: boolean;
  safeToDisable: boolean;
  type: "launch-agent" | "login-item" | "startup" | "service";
};

export class SpeedScanner extends BaseScanner {
  readonly id = "speed";
  readonly name = "Speed";
  readonly description = "Optimize startup items and background services";
  readonly supportedOS: SupportedOS[] = ["mac", "win", "linux"];

  async scan(options: ScanOptions): Promise<ScanItem[]> {
    Logger.info(this.id, "Starting speed scan");
    const items: ScanItem[] = [];

    // Scan startup items
    const startupItems = await this.scanStartupItems(options);
    items.push(...startupItems);

    // Scan launch agents (macOS)
    const launchAgents = await this.scanLaunchAgents(options);
    items.push(...launchAgents);

    // Scan background services
    const services = await this.scanBackgroundServices(options);
    items.push(...services);

    Logger.info(this.id, `Speed scan complete. Found ${items.length} items`);
    return items;
  }

  private async scanStartupItems(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const os = platform();

    try {
      if (os === "darwin") {
        // macOS: Check Login Items via defaults command
        items.push(...(await this.scanMacOSLoginItems(options)));
      } else if (os === "win32") {
        // Windows: Check startup registry and folders
        items.push(...(await this.scanWindowsStartup(options)));
      } else {
        // Linux: Check autostart directories
        items.push(...(await this.scanLinuxAutostart(options)));
      }
    } catch (error) {
      Logger.warn(this.id, "Failed to scan startup items", {
        error: error instanceof Error ? error.message : "Unknown",
      });
    }

    return items;
  }

  private async scanMacOSLoginItems(
    _options: ScanOptions
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    try {
      // Scan login items plist
      const loginItemsPlist = join(
        homedir(),
        "Library/Preferences/com.apple.loginitems.plist"
      );

      if (existsSync(loginItemsPlist)) {
        const stats = await fs.stat(loginItemsPlist);

        items.push({
          id: `login_items_${Date.now()}`,
          path: loginItemsPlist,
          sizeBytes: stats.size,
          discoveredAt: new Date().toISOString(),
          category: "startup-item",
          reason: "macOS login items configuration",
          safeToDelete: false, // Don't delete, only suggest to disable
          confidence: 0.8,
          metadata: {
            type: "login-items",
            platform: "macOS",
            action: "review-and-disable",
          },
        });
      }
    } catch (error) {
      Logger.debug(this.id, "Failed to scan macOS login items");
    }

    return items;
  }

  private async scanWindowsStartup(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    const startupPaths = [
      join(
        homedir(),
        "AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup"
      ),
      "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup",
    ];

    for (const startupPath of startupPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(startupPath)) continue;

        const entries = await fs.readdir(startupPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile()) {
            const fullPath = join(startupPath, entry.name);
            const stats = await fs.stat(fullPath);

            items.push({
              id: `startup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: fullPath,
              sizeBytes: stats.size,
              discoveredAt: new Date().toISOString(),
              category: "startup-item",
              reason: `Windows startup item: ${entry.name}`,
              safeToDelete: false,
              confidence: 0.7,
              metadata: {
                type: "startup-shortcut",
                fileName: entry.name,
                platform: "Windows",
              },
            });
          }
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan startup path: ${startupPath}`);
      }
    }

    return items;
  }

  private async scanLinuxAutostart(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    const autostartPaths = [
      join(homedir(), ".config/autostart"),
      "/etc/xdg/autostart",
    ];

    for (const autostartPath of autostartPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(autostartPath)) continue;

        const entries = await fs.readdir(autostartPath, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith(".desktop")) {
            const fullPath = join(autostartPath, entry.name);
            const stats = await fs.stat(fullPath);

            items.push({
              id: `autostart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: fullPath,
              sizeBytes: stats.size,
              discoveredAt: new Date().toISOString(),
              category: "startup-item",
              reason: `Linux autostart application: ${entry.name}`,
              safeToDelete: false,
              confidence: 0.7,
              metadata: {
                type: "autostart-desktop",
                fileName: entry.name,
                platform: "Linux",
              },
            });
          }
        }
      } catch (error) {
        Logger.debug(
          this.id,
          `Failed to scan autostart path: ${autostartPath}`
        );
      }
    }

    return items;
  }

  private async scanLaunchAgents(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    if (platform() !== "darwin") return items;

    const launchAgentPaths = [
      join(homedir(), "Library/LaunchAgents"),
      "/Library/LaunchAgents",
      "/Library/LaunchDaemons",
    ];

    for (const agentPath of launchAgentPaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(agentPath)) continue;

        const entries = await fs.readdir(agentPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith(".plist")) {
            const fullPath = join(agentPath, entry.name);
            const stats = await fs.stat(fullPath);

            // Try to determine if it's safe to disable
            const safeToDisable = this.isSafeToDisableLaunchAgent(entry.name);

            items.push({
              id: `launch_agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: fullPath,
              sizeBytes: stats.size,
              discoveredAt: new Date().toISOString(),
              category: "launch-agent",
              reason: `macOS launch agent: ${entry.name}`,
              safeToDelete: false, // Never delete, only disable
              confidence: safeToDisable ? 0.8 : 0.4,
              metadata: {
                type: "launch-agent",
                fileName: entry.name,
                safeToDisable,
                location: agentPath,
              },
            });
          }
        }
      } catch (error) {
        Logger.debug(this.id, `Failed to scan launch agents: ${agentPath}`);
      }
    }

    return items;
  }

  private async scanBackgroundServices(
    options: ScanOptions
  ): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    const os = platform();

    try {
      if (os === "darwin") {
        // macOS: check for running daemons
        // This would require elevated permissions, so we'll just note system services
      } else if (os === "win32") {
        // Windows: check services
        // Would require admin, so provide guidance only
      } else if (os === "linux") {
        // Linux: check systemd services
        items.push(...(await this.scanSystemdServices(options)));
      }
    } catch (error) {
      Logger.warn(this.id, "Failed to scan background services");
    }

    return items;
  }

  private async scanSystemdServices(options: ScanOptions): Promise<ScanItem[]> {
    const items: ScanItem[] = [];

    const servicePaths = [
      join(homedir(), ".config/systemd/user"),
      "/etc/systemd/user",
    ];

    for (const servicePath of servicePaths) {
      if (options.cancelToken?.cancelled) break;

      try {
        if (!existsSync(servicePath)) continue;

        const entries = await fs.readdir(servicePath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith(".service")) {
            const fullPath = join(servicePath, entry.name);
            const stats = await fs.stat(fullPath);

            items.push({
              id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: fullPath,
              sizeBytes: stats.size,
              discoveredAt: new Date().toISOString(),
              category: "background-service",
              reason: `systemd user service: ${entry.name}`,
              safeToDelete: false,
              confidence: 0.5,
              metadata: {
                type: "systemd-service",
                fileName: entry.name,
                platform: "Linux",
              },
            });
          }
        }
      } catch (error) {
        Logger.debug(
          this.id,
          `Failed to scan systemd services: ${servicePath}`
        );
      }
    }

    return items;
  }

  private isSafeToDisableLaunchAgent(fileName: string): boolean {
    // Known safe-to-disable launch agents
    const safePatterns = [
      "com.adobe.",
      "com.microsoft.update",
      "com.google.keystone",
      "com.dropbox.",
    ];

    // Critical system agents (never disable)
    const criticalPatterns = ["com.apple.", "system."];

    if (criticalPatterns.some((pattern) => fileName.includes(pattern))) {
      return false;
    }

    return safePatterns.some((pattern) => fileName.includes(pattern));
  }

  async clean(
    items: ScanItem[],
    _options: { backup: boolean; quarantine: boolean }
  ): Promise<CleanResult> {
    Logger.info(this.id, `Processing ${items.length} speed optimization items`);

    // For speed items, we don't actually delete files
    // We provide recommendations for the user to manually disable items
    return {
      success: true,
      itemsCleaned: 0,
      spaceFreed: 0,
      errors: [],
      quarantined: false,
    };
  }

  async restore(_quarantineId: string): Promise<boolean> {
    // Speed items are not quarantined, so nothing to restore
    return true;
  }
}
