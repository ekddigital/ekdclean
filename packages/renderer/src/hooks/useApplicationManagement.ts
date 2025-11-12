// EKD Clean - Application Management Hook
// Built by EKD Digital

import { useState, useCallback } from "react";
import {
  ApplicationAPI,
  ApplicationInfo,
  ClosurePrompt,
  ApplicationCloseResult,
  showApplicationToast,
} from "../services/ApplicationAPI";

export interface ApplicationManagementState {
  isAnalyzing: boolean;
  isClosing: boolean;
  currentPrompt: ClosurePrompt | null;
  blockedApplications: ApplicationInfo[];
  error: string | null;
}

export const useApplicationManagement = () => {
  const [state, setState] = useState<ApplicationManagementState>({
    isAnalyzing: false,
    isClosing: false,
    currentPrompt: null,
    blockedApplications: [],
    error: null,
  });

  /**
   * Analyze files to see if any applications are blocking deletion
   */
  const analyzeFileLocks = useCallback(
    async (filePaths: string[]): Promise<ClosurePrompt | null> => {
      setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        const prompt = await ApplicationAPI.analyzeFileLocks(filePaths);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          currentPrompt: prompt,
          blockedApplications: prompt?.applications || [],
        }));

        if (prompt && prompt.applications.length > 0) {
          showApplicationToast(
            `Found ${prompt.applications.length} applications using files to be cleaned`,
            "warning"
          );
        }

        return prompt;
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to analyze file locks";
        setState((prev) => ({ ...prev, isAnalyzing: false, error: errorMsg }));
        showApplicationToast(errorMsg, "error");
        return null;
      }
    },
    []
  );

  /**
   * Close specific applications
   */
  const closeApplications = useCallback(
    async (
      apps: ApplicationInfo[],
      force: boolean = false
    ): Promise<ApplicationCloseResult> => {
      setState((prev) => ({ ...prev, isClosing: true, error: null }));

      try {
        const result = await ApplicationAPI.closeApplications(apps, force);

        setState((prev) => ({
          ...prev,
          isClosing: false,
          blockedApplications: prev.blockedApplications.filter(
            (app) =>
              !result.closed.find(
                (closed) => closed.processId === app.processId
              )
          ),
        }));

        // Show success/failure feedback
        if (result.closed.length > 0) {
          showApplicationToast(
            `Successfully closed ${result.closed.length} application${result.closed.length > 1 ? "s" : ""}`,
            "success"
          );
        }

        if (result.failed.length > 0) {
          showApplicationToast(
            `Failed to close ${result.failed.length} application${result.failed.length > 1 ? "s" : ""}: ${result.failed.map((app) => app.name).join(", ")}`,
            "error"
          );
        }

        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to close applications";
        setState((prev) => ({ ...prev, isClosing: false, error: errorMsg }));
        showApplicationToast(errorMsg, "error");
        return { closed: [], failed: apps };
      }
    },
    []
  );

  /**
   * Close all blocked applications with user choice of force/graceful
   */
  const closeAllBlockedApplications = useCallback(
    async (force: boolean = false): Promise<boolean> => {
      if (state.blockedApplications.length === 0) {
        showApplicationToast("No applications to close", "warning");
        return true;
      }

      const result = await closeApplications(state.blockedApplications, force);
      return result.failed.length === 0;
    },
    [state.blockedApplications, closeApplications]
  );

  /**
   * Verify that applications have been closed
   */
  const verifyApplicationsClosed = useCallback(
    async (apps: ApplicationInfo[]): Promise<boolean> => {
      try {
        const verification =
          await ApplicationAPI.verifyApplicationsClosed(apps);

        setState((prev) => ({
          ...prev,
          blockedApplications: verification.stillRunning,
        }));

        if (verification.stillRunning.length > 0) {
          showApplicationToast(
            `${verification.stillRunning.length} application${verification.stillRunning.length > 1 ? "s are" : " is"} still running`,
            "warning"
          );
          return false;
        }

        return true;
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to verify application status";
        setState((prev) => ({ ...prev, error: errorMsg }));
        showApplicationToast(errorMsg, "error");
        return false;
      }
    },
    []
  );

  /**
   * Get list of all running applications (for debugging/info)
   */
  const getRunningApplications = useCallback(async (): Promise<
    ApplicationInfo[]
  > => {
    try {
      return await ApplicationAPI.getRunningApplications();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to get running applications";
      setState((prev) => ({ ...prev, error: errorMsg }));
      showApplicationToast(errorMsg, "error");
      return [];
    }
  }, []);

  /**
   * Clear current prompt and reset state
   */
  const clearPrompt = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPrompt: null,
      error: null,
    }));
  }, []);

  /**
   * Reset all application management state
   */
  const resetState = useCallback(() => {
    setState({
      isAnalyzing: false,
      isClosing: false,
      currentPrompt: null,
      blockedApplications: [],
      error: null,
    });
  }, []);

  return {
    // State
    ...state,

    // Actions
    analyzeFileLocks,
    closeApplications,
    closeAllBlockedApplications,
    verifyApplicationsClosed,
    getRunningApplications,
    clearPrompt,
    resetState,

    // Computed state
    hasBlockedApplications: state.blockedApplications.length > 0,
    canProceedWithCleaning: state.blockedApplications.length === 0,
    isLoading: state.isAnalyzing || state.isClosing,
  };
};
