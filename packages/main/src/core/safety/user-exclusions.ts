// EKD Clean - User Exclusions Manager
// Built by EKD Digital
// Manages what users want to exclude from cleaning

import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import { Logger } from "../logger";

export interface ExclusionRule {
  id: string;
  type: "path" | "pattern" | "category" | "app";
  value: string;
  reason?: string;
  createdAt: string;
}

export interface ScanPreferences {
  exclusions: ExclusionRule[];
  autoSelectSafe: boolean; // Auto-select items with high confidence
  minConfidence: number; // Minimum confidence to auto-select (0-1)
  categories: {
    [key: string]: boolean; // Enable/disable entire categories
  };
}

export class UserExclusionsManager {
  private static readonly CONFIG_PATH = join(
    homedir(),
    ".ekdclean",
    "preferences.json"
  );
  private static preferences: ScanPreferences | null = null;

  /**
   * Load user preferences from disk
   */
  static async load(): Promise<ScanPreferences> {
    if (this.preferences) return this.preferences;

    try {
      const content = await fs.readFile(this.CONFIG_PATH, "utf-8");
      this.preferences = JSON.parse(content);
      Logger.info("ExclusionsManager", "Loaded user preferences");
    } catch (error) {
      // File doesn't exist, create defaults
      this.preferences = this.getDefaultPreferences();
      await this.save();
      Logger.info("ExclusionsManager", "Created default preferences");
    }

    return this.preferences!;
  }

  /**
   * Save preferences to disk
   */
  static async save(): Promise<void> {
    if (!this.preferences) return;

    try {
      const dir = join(homedir(), ".ekdclean");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        this.CONFIG_PATH,
        JSON.stringify(this.preferences, null, 2),
        "utf-8"
      );
      Logger.info("ExclusionsManager", "Saved user preferences");
    } catch (error) {
      Logger.error("ExclusionsManager", "Failed to save preferences", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(): ScanPreferences {
    return {
      exclusions: [],
      autoSelectSafe: true,
      minConfidence: 0.85,
      categories: {
        "browser-cache": true,
        "app-cache": true,
        "dev-cache": true,
        temp: true,
        logs: true,
        "crash-reports": true,
        trash: true,
        "large-old-files": false, // User should review
        "mail-attachments": false, // User should review
        "photo-junk": false, // User should review
      },
    };
  }

  /**
   * Add an exclusion rule
   */
  static async addExclusion(
    type: ExclusionRule["type"],
    value: string,
    reason?: string
  ): Promise<void> {
    const prefs = await this.load();

    // Check if exclusion already exists
    const exists = prefs.exclusions.some(
      (e) => e.type === type && e.value === value
    );
    if (exists) {
      Logger.debug("ExclusionsManager", `Exclusion already exists: ${value}`);
      return;
    }

    const exclusion: ExclusionRule = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      value,
      reason,
      createdAt: new Date().toISOString(),
    };

    prefs.exclusions.push(exclusion);
    await this.save();

    Logger.info("ExclusionsManager", `Added exclusion: ${type} - ${value}`);
  }

  /**
   * Remove an exclusion rule
   */
  static async removeExclusion(id: string): Promise<void> {
    const prefs = await this.load();
    prefs.exclusions = prefs.exclusions.filter((e) => e.id !== id);
    await this.save();

    Logger.info("ExclusionsManager", `Removed exclusion: ${id}`);
  }

  /**
   * Check if a path should be excluded
   */
  static async shouldExclude(
    path: string,
    category?: string
  ): Promise<boolean> {
    const prefs = await this.load();

    // Check category exclusion
    if (category && prefs.categories[category] === false) {
      return true;
    }

    // Check explicit exclusions
    for (const exclusion of prefs.exclusions) {
      switch (exclusion.type) {
        case "path":
          if (path === exclusion.value || path.startsWith(exclusion.value)) {
            return true;
          }
          break;

        case "pattern":
          try {
            const regex = new RegExp(exclusion.value, "i");
            if (regex.test(path)) {
              return true;
            }
          } catch (error) {
            Logger.warn(
              "ExclusionsManager",
              `Invalid pattern: ${exclusion.value}`
            );
          }
          break;

        case "category":
          if (category === exclusion.value) {
            return true;
          }
          break;

        case "app":
          if (path.includes(exclusion.value)) {
            return true;
          }
          break;
      }
    }

    return false;
  }

  /**
   * Check if an item should be auto-selected for cleaning
   */
  static async shouldAutoSelect(
    confidence: number,
    category: string
  ): Promise<boolean> {
    const prefs = await this.load();

    // Category must be enabled
    if (prefs.categories[category] === false) {
      return false;
    }

    // Must meet minimum confidence
    if (confidence < prefs.minConfidence) {
      return false;
    }

    // Auto-select must be enabled
    return prefs.autoSelectSafe;
  }

  /**
   * Toggle a category on/off
   */
  static async toggleCategory(
    category: string,
    enabled: boolean
  ): Promise<void> {
    const prefs = await this.load();
    prefs.categories[category] = enabled;
    await this.save();

    Logger.info(
      "ExclusionsManager",
      `Toggled category ${category}: ${enabled}`
    );
  }

  /**
   * Get all exclusions
   */
  static async getExclusions(): Promise<ExclusionRule[]> {
    const prefs = await this.load();
    return prefs.exclusions;
  }

  /**
   * Get current preferences
   */
  static async getPreferences(): Promise<ScanPreferences> {
    return await this.load();
  }

  /**
   * Update preferences
   */
  static async updatePreferences(
    updates: Partial<ScanPreferences>
  ): Promise<void> {
    const prefs = await this.load();
    this.preferences = { ...prefs, ...updates };
    await this.save();
  }

  /**
   * Reset to defaults
   */
  static async reset(): Promise<void> {
    this.preferences = this.getDefaultPreferences();
    await this.save();
    Logger.info("ExclusionsManager", "Reset preferences to defaults");
  }
}
