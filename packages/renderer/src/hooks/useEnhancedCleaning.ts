// EKD Clean - Enhanced Cleaning Hook with Application Management
// Built by EKD Digital

import { useState, useCallback } from "react";
import { ScanResult, CleanResult } from "../types";
import { useApplicationManagement } from "./useApplicationManagement";
import { showApplicationToast } from "../services/ApplicationAPI";

export interface EnhancedCleaningState {
  isCleaning: boolean;
  isAnalyzing: boolean;
  cleaningProgress: {
    current: number;
    total: number;
    currentCategory: string;
    filesRemoved: number;
    spaceFreed: number;
  } | null;
  error: string | null;
  showApplicationModal: boolean;
}

export const useEnhancedCleaning = () => {
  const [state, setState] = useState<EnhancedCleaningState>({
    isCleaning: false,
    isAnalyzing: false,
    cleaningProgress: null,
    error: null,
    showApplicationModal: false,
  });

  const applicationManager = useApplicationManagement();

  /**
   * Enhanced cleaning process with application management
   */
  const startEnhancedCleaning = useCallback(
    async (scanResults: ScanResult[]): Promise<CleanResult | null> => {
      if (scanResults.length === 0) {
        showApplicationToast("No files to clean", "warning");
        return null;
      }

      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        showApplicationModal: false,
      }));

      try {
        // Step 1: Extract file paths from scan results
        const filePaths: string[] = [];

        for (const result of scanResults) {
          if (result.files && Array.isArray(result.files)) {
            // Handle array of file objects
            result.files.forEach((file) => {
              if (typeof file === "string") {
                filePaths.push(file);
              } else if (file && typeof file === "object" && "path" in file) {
                filePaths.push(file.path);
              }
            });
          } else if (result.path && typeof result.path === "string") {
            // Handle semicolon-separated paths
            const paths = result.path
              .split(";")
              .map((p) => p.trim())
              .filter((p) => p.length > 0);
            filePaths.push(...paths);
          }
        }

        console.log(
          `Analyzing ${filePaths.length} file paths for application locks...`
        );

        // Step 2: Analyze for application locks
        const closurePrompt =
          await applicationManager.analyzeFileLocks(filePaths);

        setState((prev) => ({ ...prev, isAnalyzing: false }));

        // Step 3: If applications are blocking, show modal
        if (closurePrompt && closurePrompt.applications.length > 0) {
          console.log(
            `Found ${closurePrompt.applications.length} applications blocking cleanup:`
          );
          closurePrompt.applications.forEach((app) => {
            console.log(
              `- ${app.name} (PID: ${app.processId}) using ${app.usingFiles.length} files`
            );
          });

          setState((prev) => ({ ...prev, showApplicationModal: true }));

          // Return early - user needs to handle application closure
          return null;
        }

        // Step 4: No applications blocking - proceed with cleaning
        return await performActualCleaning(scanResults);
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to analyze files for cleaning";
        console.error("Enhanced cleaning analysis failed:", error);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: errorMsg,
        }));

        showApplicationToast(errorMsg, "error");
        return null;
      }
    },
    [applicationManager]
  );

  /**
   * Perform the actual cleaning after applications are handled
   */
  const performActualCleaning = useCallback(
    async (scanResults: ScanResult[]): Promise<CleanResult | null> => {
      setState((prev) => ({
        ...prev,
        isCleaning: true,
        cleaningProgress: {
          current: 0,
          total: scanResults.length,
          currentCategory: "Preparing...",
          filesRemoved: 0,
          spaceFreed: 0,
        },
      }));

      try {
        console.log("Starting actual file cleaning...");
        const cleanResult = await window.electronAPI.cleanFiles(scanResults);

        setState((prev) => ({
          ...prev,
          isCleaning: false,
          cleaningProgress: null,
        }));

        console.log("Cleaning completed:", cleanResult);

        if (cleanResult.filesRemoved > 0) {
          showApplicationToast(
            `Successfully cleaned ${cleanResult.filesRemoved} files, freed ${cleanResult.spaceFreed} bytes`,
            "success"
          );
        } else if (cleanResult.errors && cleanResult.errors.length > 0) {
          showApplicationToast(
            `Cleaning completed with errors: ${cleanResult.errors.length} items failed`,
            "warning"
          );
        } else {
          showApplicationToast(
            "Cleaning completed - no files were removed",
            "warning"
          );
        }

        return cleanResult;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to clean files";
        console.error("Actual cleaning failed:", error);

        setState((prev) => ({
          ...prev,
          isCleaning: false,
          cleaningProgress: null,
          error: errorMsg,
        }));

        showApplicationToast(errorMsg, "error");
        return null;
      }
    },
    []
  );

  /**
   * Handle user's decision to close applications and proceed
   */
  const handleCloseApplicationsAndProceed = useCallback(
    async (
      scanResults: ScanResult[],
      force: boolean = false
    ): Promise<CleanResult | null> => {
      console.log(
        `Attempting to close ${applicationManager.blockedApplications.length} applications (force: ${force})`
      );

      const closeResult =
        await applicationManager.closeAllBlockedApplications(force);

      if (closeResult) {
        // Applications closed successfully - proceed with cleaning
        setState((prev) => ({ ...prev, showApplicationModal: false }));

        // Wait a moment for applications to fully close
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return await performActualCleaning(scanResults);
      } else {
        // Some applications couldn't be closed
        showApplicationToast(
          "Some applications could not be closed. Try force close or close them manually.",
          "warning"
        );
        return null;
      }
    },
    [applicationManager, performActualCleaning]
  );

  /**
   * Handle user's decision to skip application closure and try cleaning anyway
   */
  const handleSkipApplicationsAndProceed = useCallback(
    async (scanResults: ScanResult[]): Promise<CleanResult | null> => {
      console.log(
        "User chose to skip application closure - attempting cleaning anyway"
      );

      setState((prev) => ({ ...prev, showApplicationModal: false }));
      showApplicationToast(
        "Proceeding with cleaning despite blocked applications. Some files may not be deleted.",
        "warning"
      );

      return await performActualCleaning(scanResults);
    },
    [performActualCleaning]
  );

  /**
   * Cancel the cleaning process
   */
  const handleCancelCleaning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showApplicationModal: false,
      error: null,
    }));
    applicationManager.resetState();
  }, [applicationManager]);

  /**
   * Reset all cleaning state
   */
  const resetCleaningState = useCallback(() => {
    setState({
      isCleaning: false,
      isAnalyzing: false,
      cleaningProgress: null,
      error: null,
      showApplicationModal: false,
    });
    applicationManager.resetState();
  }, [applicationManager]);

  return {
    // State
    ...state,
    applicationManager,

    // Actions
    startEnhancedCleaning,
    performActualCleaning,
    handleCloseApplicationsAndProceed,
    handleSkipApplicationsAndProceed,
    handleCancelCleaning,
    resetCleaningState,

    // Computed state
    isLoading:
      state.isCleaning || state.isAnalyzing || applicationManager.isLoading,
    canProceedWithCleaning:
      !state.showApplicationModal && applicationManager.canProceedWithCleaning,
  };
};
