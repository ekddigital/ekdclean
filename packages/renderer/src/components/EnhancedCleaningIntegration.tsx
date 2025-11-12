// EKD Clean - Enhanced Cleaning Integration Component
// Built by EKD Digital

import React from "react";
import { ApplicationBlockingModal } from "./ApplicationBlockingModal";
import { useEnhancedCleaning } from "../hooks/useEnhancedCleaning";
import { ScanResult } from "../types";
import { ApplicationInfo } from "../services/ApplicationAPI";

interface EnhancedCleaningIntegrationProps {
  scanResults: ScanResult[];
  onCleaningComplete?: (success: boolean) => void;
  onCleaningStart?: () => void;
  children: (props: {
    startCleaning: () => void;
    isLoading: boolean;
    canClean: boolean;
    error?: string;
  }) => React.ReactNode;
}

export const EnhancedCleaningIntegration: React.FC<
  EnhancedCleaningIntegrationProps
> = ({ scanResults, onCleaningComplete, onCleaningStart, children }) => {
  const cleaning = useEnhancedCleaning();

  const handleStartCleaning = async () => {
    onCleaningStart?.();

    const result = await cleaning.startEnhancedCleaning(scanResults);

    if (result !== null) {
      // Cleaning completed (either success or failure)
      onCleaningComplete?.(result.filesRemoved > 0);
    }
    // If result is null, user needs to handle application closure first
  };

  const handleCloseApplications = async (
    apps: ApplicationInfo[],
    force: boolean
  ) => {
    const result = await cleaning.handleCloseApplicationsAndProceed(
      scanResults,
      force
    );

    if (result !== null) {
      onCleaningComplete?.(result.filesRemoved > 0);
    }
  };

  const handleSkipAndProceed = async () => {
    const result = await cleaning.handleSkipApplicationsAndProceed(scanResults);

    if (result !== null) {
      onCleaningComplete?.(result.filesRemoved > 0);
    }
  };

  return (
    <>
      {children({
        startCleaning: handleStartCleaning,
        isLoading: cleaning.isLoading,
        canClean: scanResults.length > 0,
        error: cleaning.error || undefined,
      })}

      {cleaning.showApplicationModal &&
        cleaning.applicationManager.currentPrompt && (
          <ApplicationBlockingModal
            isOpen={cleaning.showApplicationModal}
            prompt={cleaning.applicationManager.currentPrompt}
            onClose={cleaning.handleCancelCleaning}
            onCloseApplications={handleCloseApplications}
            onSkip={handleSkipAndProceed}
          />
        )}
    </>
  );
};

// Usage example for integration into existing components:
/*
// In MainDashboard.tsx or any other component with cleaning functionality:

<EnhancedCleaningIntegration
  scanResults={scanResults}
  onCleaningComplete={(success) => {
    if (success) {
      setScanResults([]);
      soundManager.playSuccess();
      // Refresh activity and memory usage
      setTimeout(() => {
        loadActivityHistory();
        loadMemoryUsage();
      }, 500);
    }
  }}
  onCleaningStart={() => {
    soundManager.playClick();
  }}
>
  {({ startCleaning, isLoading, canClean, error }) => (
    <button
      onClick={startCleaning}
      disabled={!canClean || isLoading}
      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50"
    >
      {isLoading ? 'Processing...' : 'Clean Files'}
    </button>
  )}
</EnhancedCleaningIntegration>
*/
