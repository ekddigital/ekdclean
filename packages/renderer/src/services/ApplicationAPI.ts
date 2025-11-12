// EKD Clean - Application Management API
// Built by EKD Digital

export interface ApplicationInfo {
  name: string;
  processId: number;
  bundleId?: string;
  path: string;
  usingFiles: string[];
  canForceQuit: boolean;
  isSystemCritical: boolean;
}

export interface ClosurePrompt {
  applications: ApplicationInfo[];
  affectedPaths: string[];
  estimatedSpaceToFree: number;
  message: string;
  canForceClose: boolean;
}

export interface ApplicationCloseResult {
  closed: ApplicationInfo[];
  failed: ApplicationInfo[];
}

export interface ApplicationVerificationResult {
  stillRunning: ApplicationInfo[];
  closed: ApplicationInfo[];
}

export class ApplicationAPI {
  /**
   * Analyze which applications are blocking file deletion
   */
  static async analyzeFileLocks(
    filePaths: string[]
  ): Promise<ClosurePrompt | null> {
    try {
      const result = await window.electronAPI.invoke(
        "app:analyze-file-locks",
        filePaths
      );

      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to analyze file locks:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error analyzing file locks:", error);
      return null;
    }
  }

  /**
   * Close specific applications
   */
  static async closeApplications(
    apps: ApplicationInfo[],
    force: boolean = false
  ): Promise<ApplicationCloseResult> {
    try {
      const result = await window.electronAPI.invoke(
        "app:close-applications",
        apps,
        force
      );

      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to close applications:", result.error);
        return { closed: [], failed: apps };
      }
    } catch (error) {
      console.error("Error closing applications:", error);
      return { closed: [], failed: apps };
    }
  }

  /**
   * Verify applications are closed
   */
  static async verifyApplicationsClosed(
    apps: ApplicationInfo[]
  ): Promise<ApplicationVerificationResult> {
    try {
      const result = await window.electronAPI.invoke("app:verify-closed", apps);

      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to verify applications:", result.error);
        return { stillRunning: apps, closed: [] };
      }
    } catch (error) {
      console.error("Error verifying applications:", error);
      return { stillRunning: apps, closed: [] };
    }
  }

  /**
   * Get all running applications (for UI)
   */
  static async getRunningApplications(): Promise<ApplicationInfo[]> {
    try {
      const result = await window.electronAPI.invoke("app:get-running");

      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to get running applications:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting running applications:", error);
      return [];
    }
  }
}

// Toast notification helpers for application management
export const showApplicationToast = (
  message: string,
  type: "success" | "warning" | "error" = "success"
) => {
  // This will integrate with your existing toast system
  const event = new CustomEvent("show-toast", {
    detail: { message, type, duration: type === "error" ? 6000 : 4000 },
  });
  window.dispatchEvent(event);
};

export const showApplicationPrompt = (
  prompt: ClosurePrompt
): Promise<"close" | "force" | "skip" | "cancel"> => {
  return new Promise((resolve) => {
    const event = new CustomEvent("show-app-prompt", {
      detail: { prompt, resolve },
    });
    window.dispatchEvent(event);
  });
};
