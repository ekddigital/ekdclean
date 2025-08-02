// EKD Clean - System Junk View
// Built by EKD Digital

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, HardDrive, Play } from "lucide-react";
import { ScanResult } from "../../types";
import { SoundManager } from "../../utils/SoundManager";

export const SystemJunkView: React.FC = () => {
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

  const handleSystemJunkScan = async () => {
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

      // Perform system junk specific scan
      const results = await window.electronAPI.scanSystem();

      clearInterval(progressInterval);
      setScanProgress(100);
      setScanResults(results);
      setIsScanning(false);
      soundManager.playSuccess();
    } catch (error) {
      console.error("System junk scan failed:", error);
      setIsScanning(false);
      soundManager.playError();
    }
  };

  const handleCleanSystemJunk = async () => {
    if (scanResults.length === 0) return;

    try {
      soundManager.playClick();
      await window.electronAPI.cleanFiles(scanResults);
      setScanResults([]);
      soundManager.playSuccess();
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
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                System Junk
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Cache files, logs, and temporary system data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Scan Section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/30 rounded-3xl" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100/30 to-orange-100/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <HardDrive className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      System Junk Cleanup
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {isScanning
                        ? "Scanning system cache, logs, and temporary files..."
                        : "Find and remove system cache files, logs, and temporary data that are safe to delete"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleSystemJunkScan}
                    disabled={isScanning}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="h-5 w-5" />
                    {isScanning ? "Scanning..." : "Scan System Junk"}
                  </motion.button>

                  {scanResults.length > 0 && (
                    <motion.button
                      onClick={handleCleanSystemJunk}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Trash2 className="h-5 w-5" />
                      Clean System Junk
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-600 text-sm font-medium">
                      {Math.round(scanProgress)}% complete
                    </p>
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Scanning...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {scanResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 rounded-2xl p-6 border border-gray-200/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      System Junk Found
                    </h3>
                    <div className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-4 py-2 rounded-xl font-semibold text-sm">
                      {getTotalFiles()} items • {formatBytes(getTotalSize())}{" "}
                      recoverable
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {scanResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between bg-white/80 rounded-xl p-4 border border-gray-200/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-red-200 shadow-lg" />
                          <div>
                            <div className="text-gray-900 font-semibold text-sm">
                              {result.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {result.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-bold text-sm">
                            {formatBytes(result.size)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {result.files} files
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
