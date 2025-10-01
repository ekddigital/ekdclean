// EKD Clean - Whitelist/Blacklist Management
// Built by EKD Digital

import { promises as fs, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { minimatch } from "minimatch";

export type WhitelistRule = {
  id: string;
  pattern: string;
  type: "path" | "glob" | "hash";
  reason: string;
  addedAt: string;
};

export class WhitelistManager {
  private static configPath = join(homedir(), ".ekdclean", "whitelist.json");
  private static rules: Map<string, WhitelistRule> = new Map();
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(join(homedir(), ".ekdclean"), { recursive: true });

      if (existsSync(this.configPath)) {
        const data = await fs.readFile(this.configPath, "utf-8");
        const rules: WhitelistRule[] = JSON.parse(data);
        rules.forEach(rule => this.rules.set(rule.id, rule));
      }

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize whitelist:", error);
      throw error;
    }
  }

  static async addRule(
    pattern: string,
    type: "path" | "glob" | "hash",
    reason: string
  ): Promise<string> {
    await this.initialize();

    const id = `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const rule: WhitelistRule = {
      id,
      pattern,
      type,
      reason,
      addedAt: new Date().toISOString(),
    };

    this.rules.set(id, rule);
    await this.save();
    return id;
  }

  static async removeRule(id: string): Promise<boolean> {
    await this.initialize();
    const deleted = this.rules.delete(id);
    if (deleted) {
      await this.save();
    }
    return deleted;
  }

  static async isWhitelisted(path: string, hash?: string): Promise<boolean> {
    await this.initialize();

    for (const rule of this.rules.values()) {
      switch (rule.type) {
        case "path":
          if (path === rule.pattern || path.startsWith(rule.pattern)) {
            return true;
          }
          break;

        case "glob":
          if (minimatch(path, rule.pattern)) {
            return true;
          }
          break;

        case "hash":
          if (hash && hash === rule.pattern) {
            return true;
          }
          break;
      }
    }

    return false;
  }

  static async listRules(): Promise<WhitelistRule[]> {
    await this.initialize();
    return Array.from(this.rules.values());
  }

  private static async save(): Promise<void> {
    try {
      const rules = Array.from(this.rules.values());
      await fs.writeFile(this.configPath, JSON.stringify(rules, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save whitelist:", error);
      throw error;
    }
  }
}
