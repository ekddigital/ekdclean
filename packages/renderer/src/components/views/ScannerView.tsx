// EKD Clean - Generic Scanner View
// Built by EKD Digital

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, FileText } from "lucide-react";
import { ScanResult } from "../../types";
import { SoundManager } from "../../utils/SoundManager";
import { CircularProgressRing } from "../CircularProgressRing";

export type ScannerViewConfig = {
  scannerId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string; // e.g., "from-blue-400 to-purple-500"
  textGradient: string; // e.g., "from-blue-600 to-purple-600"
};

export type ScannerViewProps = {
  config: ScannerViewConfig;
};

export const ScannerView: React.FC<ScannerViewProps> = ({ config }) => {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const soundManager = SoundManager.getInstance();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanResults([]);
      soundManager.playScan();

      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 20;
        });
      }, 150);

      // Call the specific scanner via IPC
      if (window.electronAPI?.scanSpecific) {
        const results = await window.electronAPI.scanSpecific(config.scannerId);
        clearInterval(progressInterval);
        setScanProgress(100);
        setScanResults(results);
        soundManager.playSuccess();
      } else {
        // Fallback for testing
        console.warn(`Scanner ${config.scannerId} API not available`);
        clearInterval(progressInterval);
        setScanProgress(100);
        setScanResults([]);
      }

      setIsScanning(false);
    } catch (error) {
      console.error(`${config.title} scan failed:`, error);
      setIsScanning(false);
      soundManager.playError();
    }
  };

  const handleClean = async () => {
    if (scanResults.length === 0) return;

    try {
      soundManager.playClick();

      if (window.electronAPI?.cleanFiles) {
        await window.electronAPI.cleanFiles(scanResults);
        setScanResults([]);
        soundManager.playSuccess();
      } else {
        console.warn("Clean API not available");
      }
    } catch (error) {
      console.error("Clean failed:", error);
      soundManager.playError();
    }
  };

  const getTotalSize = () =>
    scanResults.reduce((total, result) => total + result.size, 0);
  const getTotalFiles = () =>
    scanResults.reduce((total, result) => total + result.files, 0);

  return (
    <div
      className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden rounded-l-3xl"
      style={{ marginLeft: "260px" }}
    >
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-2xl border-b border-indigo-200/40 dark:border-gray-700/30 px-8 py-6 mx-6 mt-6 rounded-t-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
            >
              {config.icon}
            </div>
            <div>
              <h1
                className={`text-3xl font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}
              >
                {config.title}
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-base font-medium">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6 mx-6">
        {/* Ready to Scan - Circular Button */}
        {!isScanning && scanResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/20 dark:border-slate-700/30"
          >
            <div className="flex flex-col items-center justify-center text-center">
              {/* Circular Scan Button */}
              <motion.button
                onClick={handleScan}
                className="relative mb-8 focus:outline-none group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  overflow: "visible",
                }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${config.gradient.includes("blue") ? "#3B82F6" : config.gradient.includes("green") ? "#10B981" : config.gradient.includes("red") ? "#EF4444" : config.gradient.includes("yellow") ? "#F59E0B" : config.gradient.includes("purple") ? "#8B5CF6" : config.gradient.includes("indigo") ? "#6366F1" : config.gradient.includes("cyan") ? "#06B6D4" : "#F97316"}, ${config.gradient.includes("blue") ? "#8B5CF6" : config.gradient.includes("green") ? "#14B8A6" : config.gradient.includes("red") ? "#F97316" : config.gradient.includes("yellow") ? "#F97316" : config.gradient.includes("purple") ? "#A855F7" : config.gradient.includes("indigo") ? "#8B5CF6" : config.gradient.includes("cyan") ? "#3B82F6" : "#FB923C"})`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Main circular button with gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${config.gradient} shadow-2xl`}
                  style={{
                    borderRadius: "50%",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Icon in perfect center */}
                  <div
                    className="text-white"
                    style={{ fontSize: "72px", lineHeight: 1 }}
                  >
                    {config.icon}
                  </div>
                </div>

                {/* Hover ring animation */}
                <motion.div
                  className="absolute inset-0 border-4 border-white/50"
                  style={{ borderRadius: "50%" }}
                  initial={{ scale: 1, opacity: 0 }}
                  whileHover={{ scale: 1.15, opacity: 0.6 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              {/* Text content */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Ready to Scan
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
                Click the button above to scan for {config.title.toLowerCase()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Scanning Progress - Circular */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/20 dark:border-slate-700/30"
          >
            <div className="flex flex-col items-center justify-center text-center">
              {/* Circular Progress Ring */}
              <div className="mb-8">
                <CircularProgressRing
                  progress={scanProgress}
                  size={160}
                  strokeWidth={10}
                  showPercentage={true}
                  color={
                    config.gradient.includes("blue")
                      ? "#3B82F6"
                      : config.gradient.includes("green")
                        ? "#10B981"
                        : config.gradient.includes("red")
                          ? "#EF4444"
                          : config.gradient.includes("yellow")
                            ? "#F59E0B"
                            : config.gradient.includes("purple")
                              ? "#8B5CF6"
                              : config.gradient.includes("indigo")
                                ? "#6366F1"
                                : config.gradient.includes("cyan")
                                  ? "#06B6D4"
                                  : "#F97316"
                  }
                />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Scanning {config.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Analyzing your system for optimization opportunities...
              </p>
            </div>
          </motion.div>
        )}

        {/* Scan Results */}
        {!isScanning && scanResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-slate-700/30">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {scanResults.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Categories
                  </div>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-700">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {getTotalFiles()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Files Found
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}
                  >
                    {formatBytes(getTotalSize())}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Can Be Freed
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleScan}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleClean}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                >
                  <Trash2 className="w-5 h-5" />
                  Clean Now
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {scanResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/30 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center`}
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {result.category}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {result.files} files • {formatBytes(result.size)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}
                      >
                        {formatBytes(result.size)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
