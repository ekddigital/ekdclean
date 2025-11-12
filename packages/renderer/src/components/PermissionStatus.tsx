// EKD Clean - Permission Status Component
// Built by EKD Digital - Example of permission system usage

import React from "react";
import { usePermissions } from "../hooks/usePermissions";

export const PermissionStatus: React.FC = () => {
  const {
    permissionSummary,
    permissionChecks,
    isChecking,
    isRequesting,
    hasFullDiskAccess,
    hasFilesAndFolders,
    needsPermissions,
    canScanDeep,
    checkPermissions,
    requestPermissions,
    showGuidance,
    openSystemPreferences,
    getMissingRequiredPermissions,
    getRecommendations,
  } = usePermissions();

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      console.log("Permissions granted successfully!");
    } else {
      console.log("Permission request declined or failed");
    }
  };

  const handleShowGuidance = async () => {
    await showGuidance();
  };

  const handleOpenSystemPrefs = async () => {
    await openSystemPreferences();
  };

  if (isChecking && !permissionSummary) {
    return (
      <div className="bg-white/80 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-700">Checking permissions...</span>
        </div>
      </div>
    );
  }

  if (!permissionSummary) {
    return (
      <div className="bg-white/80 rounded-xl p-6 shadow-lg">
        <p className="text-slate-600">Unable to load permission status</p>
        <button
          onClick={checkPermissions}
          className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Retry Check
        </button>
      </div>
    );
  }

  const missingPermissions = getMissingRequiredPermissions();
  const recommendations = getRecommendations();

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="bg-white/80 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Permission Status
          </h3>
          <button
            onClick={checkPermissions}
            disabled={isChecking}
            className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {isChecking ? "Checking..." : "Refresh"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${permissionSummary.allGranted ? "text-green-600" : "text-amber-600"}`}
            >
              {permissionSummary.grantedCount}
            </div>
            <div className="text-sm text-slate-600">
              of {permissionSummary.totalCount} granted
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${canScanDeep ? "text-green-600" : "text-red-600"}`}
            >
              {canScanDeep ? "✓" : "✗"}
            </div>
            <div className="text-sm text-slate-600">Deep Scan</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${hasFullDiskAccess ? "text-green-600" : "text-amber-600"}`}
            >
              {hasFullDiskAccess ? "✓" : "⚠"}
            </div>
            <div className="text-sm text-slate-600">Full Disk Access</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${hasFilesAndFolders ? "text-green-600" : "text-red-600"}`}
            >
              {hasFilesAndFolders ? "✓" : "✗"}
            </div>
            <div className="text-sm text-slate-600">Files & Folders</div>
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`p-3 rounded-lg ${
            permissionSummary.allGranted
              ? "bg-green-50 border border-green-200"
              : needsPermissions
                ? "bg-red-50 border border-red-200"
                : "bg-amber-50 border border-amber-200"
          }`}
        >
          <p
            className={`text-sm ${
              permissionSummary.allGranted
                ? "text-green-800"
                : needsPermissions
                  ? "text-red-800"
                  : "text-amber-800"
            }`}
          >
            {permissionSummary.allGranted
              ? "✅ All permissions granted! EKD Clean can perform thorough system scanning and cleaning."
              : needsPermissions
                ? "❌ Required permissions are missing. EKD Clean cannot perform optimal cleaning without proper access."
                : "⚠️ Some optional permissions are missing. EKD Clean can perform basic cleaning, but some advanced features may be limited."}
          </p>
        </div>
      </div>

      {/* Individual Permission Checks */}
      {permissionChecks.length > 0 && (
        <div className="bg-white/80 rounded-xl p-6 shadow-lg">
          <h4 className="text-md font-semibold text-slate-800 mb-4">
            Permission Details
          </h4>
          <div className="space-y-3">
            {permissionChecks.map((check) => (
              <div
                key={check.name}
                className={`p-3 rounded-lg border ${
                  check.granted
                    ? "bg-green-50 border-green-200"
                    : check.required
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg ${check.granted ? "text-green-600" : "text-red-600"}`}
                      >
                        {check.granted ? "✓" : "✗"}
                      </span>
                      <span className="font-medium text-slate-800">
                        {check.displayName}
                      </span>
                      {check.required && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {check.description}
                    </p>
                    {!check.granted && check.instructions && (
                      <p className="text-sm text-slate-500 mt-1 italic">
                        {check.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Required Permissions */}
      {missingPermissions.length > 0 && (
        <div className="bg-white/80 rounded-xl p-6 shadow-lg border-l-4 border-red-500">
          <h4 className="text-md font-semibold text-red-800 mb-3">
            Missing Required Permissions
          </h4>
          <div className="space-y-2 mb-4">
            {missingPermissions.map((permission) => (
              <div key={permission.name} className="text-sm text-red-700">
                <strong>{permission.displayName}</strong>:{" "}
                {permission.description}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRequestPermissions}
              disabled={isRequesting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isRequesting ? "Requesting..." : "Request Permissions"}
            </button>
            <button
              onClick={handleShowGuidance}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Show Guidance
            </button>
            <button
              onClick={handleOpenSystemPrefs}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Open System Preferences
            </button>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white/80 rounded-xl p-6 shadow-lg border-l-4 border-amber-500">
          <h4 className="text-md font-semibold text-amber-800 mb-3">
            Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="text-sm text-amber-700">
                • {recommendation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Capability Status */}
      <div className="bg-white/80 rounded-xl p-6 shadow-lg">
        <h4 className="text-md font-semibold text-slate-800 mb-3">
          Scanning Capabilities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-3 rounded-lg border ${
              hasFilesAndFolders
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-lg ${hasFilesAndFolders ? "text-green-600" : "text-red-600"}`}
              >
                {hasFilesAndFolders ? "✓" : "✗"}
              </span>
              <span className="font-medium text-slate-800">Quick Scan</span>
            </div>
            <p className="text-sm text-slate-600">
              {hasFilesAndFolders
                ? "Can scan user directories and common cache locations"
                : "Cannot access user files - requires Files and Folders permission"}
            </p>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              canScanDeep
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-lg ${canScanDeep ? "text-green-600" : "text-amber-600"}`}
              >
                {canScanDeep ? "✓" : "⚠"}
              </span>
              <span className="font-medium text-slate-800">Deep Scan</span>
            </div>
            <p className="text-sm text-slate-600">
              {canScanDeep
                ? "Can scan system locations, application support, and protected directories"
                : "Limited scanning - requires Full Disk Access for complete system analysis"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionStatus;
