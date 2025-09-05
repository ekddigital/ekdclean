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
          className="w-full bg-gray-400 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 cursor-not-allowed"
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
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <ArrowRight className="h-6 w-6" />
          Clean {formatBytes(getTotalSize())} • {getTotalFiles()} files
        </button>
      );
    }

    return (
      <button
        onClick={onStartScan}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
      <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
        {/* Premium background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Smart & Safe Scan
                </h2>
                <p className="text-gray-600 text-sm">
                  AI-powered analysis • 100% safe cleanup
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50">
              <div className="text-sm font-semibold text-gray-700">
                {getStatusText()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {(isScanning || isCleaning) && (
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
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
                <div className="mt-2 text-sm text-gray-600">
                  Removing {cleaningProgress.filesRemoved.toLocaleString()}{" "}
                  files •{formatBytes(cleaningProgress.spaceFreed)} freed
                </div>
              )}
            </div>
          )}

          {/* Scan Results Summary */}
          {scanResults.length > 0 && !isScanning && !isCleaning && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-1">
                    {getTotalFiles().toLocaleString()} files ready for cleanup
                  </h3>
                  <p className="text-emerald-600 text-sm">
                    {formatBytes(getTotalSize())} total space can be freed
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed">
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
          {getActionButton()}
        </div>
      </div>
    </motion.div>
  );
};
