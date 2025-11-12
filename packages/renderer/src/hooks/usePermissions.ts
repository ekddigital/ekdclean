// EKD Clean - Permission Management Hook
// Built by EKD Digital

import { useState, useEffect, useCallback } from "react";

interface PermissionCheck {
  name: string;
  displayName: string;
  description: string;
  granted: boolean;
  required: boolean;
  instructions?: string;
}

interface PermissionSummary {
  allGranted: boolean;
  requiredGranted: boolean;
  grantedCount: number;
  totalCount: number;
  requiredCount: number;
  missingPermissions: string[];
  recommendations: string[];
}

export const usePermissions = () => {
  const [permissionSummary, setPermissionSummary] =
    useState<PermissionSummary | null>(null);
  const [permissionChecks, setPermissionChecks] = useState<PermissionCheck[]>(
    []
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Check all permissions
  const checkPermissions = useCallback(async () => {
    setIsChecking(true);
    try {
      const [summary, checks] = await Promise.all([
        window.electronAPI.getPermissionSummary(),
        window.electronAPI.getPermissionChecks(),
      ]);

      setPermissionSummary(summary);
      setPermissionChecks(checks);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Failed to check permissions:", error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Request permissions from user
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      const granted = await window.electronAPI.requestPermissions();

      // Refresh permission status after request
      if (granted) {
        await checkPermissions();
      }

      return granted;
    } catch (error) {
      console.error("Failed to request permissions:", error);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [checkPermissions]);

  // Show permission guidance dialog
  const showGuidance = useCallback(async (): Promise<boolean> => {
    try {
      return await window.electronAPI.showPermissionGuidance();
    } catch (error) {
      console.error("Failed to show permission guidance:", error);
      return false;
    }
  }, []);

  // Open System Preferences
  const openSystemPreferences = useCallback(async (): Promise<boolean> => {
    try {
      return await window.electronAPI.openSystemPreferences();
    } catch (error) {
      console.error("Failed to open System Preferences:", error);
      return false;
    }
  }, []);

  // Check if permissions should be requested
  const shouldRequest = useCallback(async (): Promise<boolean> => {
    try {
      return await window.electronAPI.shouldRequestPermissions();
    } catch (error) {
      console.error(
        "Failed to check if permissions should be requested:",
        error
      );
      return false;
    }
  }, []);

  // Auto-check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Derived state
  const hasFullDiskAccess =
    permissionChecks.find((check) => check.name === "fullDiskAccess")
      ?.granted ?? false;

  const hasFilesAndFolders =
    permissionChecks.find((check) => check.name === "filesAndFolders")
      ?.granted ?? false;

  const hasAccessibility =
    permissionChecks.find((check) => check.name === "accessibility")?.granted ??
    false;

  const needsPermissions =
    permissionSummary && !permissionSummary.requiredGranted;

  const canScanDeep = hasFullDiskAccess && hasFilesAndFolders;

  return {
    // State
    permissionSummary,
    permissionChecks,
    isChecking,
    isRequesting,
    lastCheck,

    // Derived state
    hasFullDiskAccess,
    hasFilesAndFolders,
    hasAccessibility,
    needsPermissions,
    canScanDeep,

    // Actions
    checkPermissions,
    requestPermissions,
    showGuidance,
    openSystemPreferences,
    shouldRequest,

    // Helper methods
    refresh: checkPermissions,
    isReady: !isChecking && permissionSummary !== null,

    // Status helpers
    getPermissionStatus: (permissionName: string) => {
      const check = permissionChecks.find((c) => c.name === permissionName);
      return check
        ? {
            granted: check.granted,
            required: check.required,
            displayName: check.displayName,
            description: check.description,
            instructions: check.instructions,
          }
        : null;
    },

    // Quick status checks
    canPerformFullScan: () => canScanDeep,
    canPerformQuickScan: () => hasFilesAndFolders, // Basic files access is enough for quick scan

    // Get missing permissions for display
    getMissingRequiredPermissions: () => {
      return permissionChecks
        .filter((check) => check.required && !check.granted)
        .map((check) => ({
          name: check.name,
          displayName: check.displayName,
          description: check.description,
          instructions: check.instructions,
        }));
    },

    // Get permission recommendations
    getRecommendations: () => {
      return permissionSummary?.recommendations ?? [];
    },
  };
};

export type UsePermissionsReturn = ReturnType<typeof usePermissions>;
