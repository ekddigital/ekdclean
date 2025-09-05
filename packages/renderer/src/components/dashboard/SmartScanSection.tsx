// EKD Clean - Smart Scan Section Component
// Built by EKD Digital - Superior to CleanMyMac

import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Shield, ArrowRight, Loader2 } from "lucide-react";

interface ScanResult {
  id: string;
  name: string;
  type: string;
  size: number;
  files: number;
}

interface CleaningProgress {
  current: number;
  total: number;
  currentCategory: string;
  filesRemoved: number;
  spaceFreed: number;
}

interface SmartScanSectionProps {
  isScanning: boolean;
  isCleaning: boolean;
  scanProgress: number;
  scanResults: ScanResult[];
  cleaningProgress: CleaningProgress;
  onStartScan: () => void;
  onStartClean: () => void;
  formatBytes: (bytes: number) => string;
  getTotalSize: () => number;
  getTotalFiles: () => number;
  isDarkMode?: boolean;
}

export const SmartScanSection: React.FC<SmartScanSectionProps> = ({
  isScanning,
  isCleaning,
  scanProgress,
  scanResults,
  cleaningProgress,
  onStartScan,
  onStartClean,
  formatBytes,
  getTotalSize,
  getTotalFiles,
  isDarkMode = false,
}) => {
  const getProgressPercentage = () => {
    if (isScanning) return scanProgress;
    if (isCleaning && cleaningProgress.total > 0) {
      return (cleaningProgress.current / cleaningProgress.total) * 100;
    }
    return 0;
  };

  const getStatusText = () => {
    if (isScanning) return `Scanning... ${Math.round(scanProgress)}%`;
    if (isCleaning) return `Cleaning ${cleaningProgress.currentCategory}...`;
    if (scanResults.length > 0) return "Scan Complete - Ready to Clean";
    return "Ready to Scan";
  };

  const getActionButton = () => {
    if (isScanning || isCleaning) {
      return (
        <button
          disabled
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 cursor-not-allowed shadow-lg"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          {isScanning ? "Scanning..." : "Cleaning..."}
        </button>
      );
    }

    if (scanResults.length > 0) {
      return (
        <button
          onClick={onStartClean}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <ArrowRight className="h-6 w-6" />
          Clean {formatBytes(getTotalSize())} • {getTotalFiles()} files
        </button>
      );
    }

    return (
      <button
        onClick={onStartScan}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <Play className="h-6 w-6" />
        Start Smart Scan
      </button>
    );
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden backdrop-blur-sm">
        {/* Premium background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2
                  className={`text-3xl font-bold mb-1 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Smart & Safe Scan
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  AI-powered analysis • 100% safe cleanup
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 border border-gray-200/50 shadow-md">
              <div className="text-sm font-semibold text-gray-700">
                {getStatusText()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {(isScanning || isCleaning) && (
            <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/30">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full rounded-full shadow-sm ${
                    isScanning
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {isCleaning && (
                <div className="mt-4 text-sm text-gray-600 font-medium">
                  Removing {cleaningProgress.filesRemoved.toLocaleString()}{" "}
                  files • {formatBytes(cleaningProgress.spaceFreed)} freed
                </div>
              )}
            </div>
          )}

          {/* Scan Results Summary */}
          {scanResults.length > 0 && !isScanning && !isCleaning && (
            <div className="mb-8 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">
                    {getTotalFiles().toLocaleString()} files ready for cleanup
                  </h3>
                  <p className="text-emerald-700 text-base font-medium">
                    {formatBytes(getTotalSize())} total space can be freed
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/30">
            <p className="text-gray-700 leading-relaxed text-base">
              {isScanning
                ? "🔍 Analyzing your system with advanced algorithms to identify safe cleanup opportunities. Your personal files are always protected."
                : isCleaning
                  ? "🧹 Safely removing identified junk files. This process is completely reversible and targets only temporary files."
                  : scanResults.length > 0
                    ? "✅ Scan complete! All identified items are 100% safe to remove. Your Documents, Photos, and personal files are protected."
                    : "🛡️ Advanced AI analysis identifies only safe cleanup targets. Documents, Photos, and personal files are always protected."}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-6">{getActionButton()}</div>
        </div>
      </div>
    </motion.div>
  );
};
