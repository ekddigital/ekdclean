// EKD Clean - Modular Dashboard Component
// Built by EKD Digital - Superior to CleanMyMac

import React from "react";
import { useDashboardLogic } from "../hooks/useDashboardLogic";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { SmartScanSection } from "./dashboard/SmartScanSection";
import { SystemStatsGrid } from "./dashboard/SystemStatsGrid";
import { ScanResultsList } from "./dashboard/ScanResultsList";

interface MainDashboardProps {
  activeItem: string;
  isDarkMode?: boolean;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  activeItem,
  isDarkMode = false,
}) => {
  const {
    // State
    scanProgress,
    scanResults,
    isScanning,
    isCleaning,
    cleaningProgress,
    activityHistory,
    systemInfo,
    memoryUsage,

    // Actions
    handleStartScan,
    handleStartClean,

    // Utilities
    formatBytes,
    formatTimeAgo,
    getTotalSize,
    getTotalFiles,
    getMemoryStatus,
  } = useDashboardLogic();

  // Don't render if we're not on the smart-scan page
  if (activeItem !== "smart-scan") {
    return null;
  }

  return (
    <div
      className={`h-full overflow-y-auto rounded-l-3xl ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
      style={{ marginLeft: "260px" }}
    >
      {/* Header */}
      <DashboardHeader
        memoryUsage={memoryUsage}
        isDarkMode={isDarkMode}
        formatBytes={formatBytes}
        getMemoryStatus={getMemoryStatus}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Smart Scan Section */}
          <SmartScanSection
            isScanning={isScanning}
            isCleaning={isCleaning}
            scanProgress={scanProgress}
            scanResults={scanResults}
            cleaningProgress={cleaningProgress}
            onStartScan={handleStartScan}
            onStartClean={handleStartClean}
            formatBytes={formatBytes}
            getTotalSize={getTotalSize}
            getTotalFiles={getTotalFiles}
            isDarkMode={isDarkMode}
          />

          {/* System Stats Grid */}
          <SystemStatsGrid
            memoryUsage={memoryUsage}
            systemInfo={systemInfo}
            activityHistory={activityHistory}
            scanResults={scanResults}
            formatBytes={formatBytes}
            formatTimeAgo={formatTimeAgo}
            getTotalSize={getTotalSize}
            getTotalFiles={getTotalFiles}
            isDarkMode={isDarkMode}
          />

          {/* Scan Results List */}
          <ScanResultsList
            scanResults={scanResults}
            formatBytes={formatBytes}
            getTotalSize={getTotalSize}
            getTotalFiles={getTotalFiles}
          />
        </div>
      </div>
    </div>
  );
};
