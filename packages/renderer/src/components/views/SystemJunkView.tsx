// EKD Clean - System Junk View
// Built by EKD Digital

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, HardDrive, Pause } from "lucide-react";
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
    <div
      className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden rounded-l-3xl"
      style={{ marginLeft: "260px" }}
    >
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/30 px-8 py-6 mx-6 mt-6 rounded-t-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trash2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                System Junk
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
                Cache files, logs, and temporary system data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Scan Section */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/20 dark:border-slate-700/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 rounded-3xl" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-400/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    System Junk Cleanup
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-base max-w-2xl">
                    {isScanning
                      ? "Scanning system cache, logs, and temporary files..."
                      : "Find and remove system cache files, logs, and temporary data that are safe to delete"}
                  </p>
                </div>

                {/* Circular Scan Button */}
                <div className="flex flex-col items-center gap-6">
                  <motion.button
                    onClick={handleSystemJunkScan}
                    disabled={isScanning}
                    className="relative focus:outline-none group disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isScanning ? 1 : 1.05 }}
                    whileTap={{ scale: isScanning ? 1 : 0.95 }}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      overflow: "visible",
                    }}
                  >
                    {/* Breathing glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full blur-2xl opacity-40"
                      style={{
                        background: "linear-gradient(135deg, #EF4444, #F97316)",
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Main button */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl"
                      style={{
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isScanning ? (
                        <Pause
                          className="text-white"
                          size={72}
                          strokeWidth={2}
                        />
                      ) : (
                        <HardDrive
                          className="text-white"
                          size={72}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    {/* Hover ring */}
                    <motion.div
                      className="absolute inset-0 border-4 border-white/50"
                      style={{ borderRadius: "50%" }}
                      initial={{ scale: 1, opacity: 0 }}
                      whileHover={{ scale: 1.15, opacity: 0.6 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    {isScanning ? "Scanning..." : "Click to Scan System Junk"}
                  </p>

                  <div className="flex gap-4">
                    {scanResults.length > 0 && (
                      <motion.button
                        onClick={handleCleanSystemJunk}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-3xl font-bold text-lg flex items-center gap-3 hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Trash2 className="h-6 w-6" />
                        Clean System Junk
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isScanning && (
                  <motion.div
                    className="mb-8 p-8 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-gray-200/30 dark:border-gray-700/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <motion.div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full shadow-sm"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <p className="text-gray-700 dark:text-gray-200 font-semibold">
                        {Math.round(scanProgress)}% complete
                      </p>
                      <div className="flex items-center gap-3 text-red-600">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-semibold">Scanning...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Results */}
                {scanResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-slate-800/70 dark:to-slate-900/60 rounded-3xl p-10 border border-gray-200/50 dark:border-gray-700/30 backdrop-blur-sm shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        System Junk Found
                      </h3>
                      <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 text-red-800 dark:text-red-200 px-6 py-3 rounded-2xl font-bold shadow-lg">
                        {getTotalFiles()} items • {formatBytes(getTotalSize())}{" "}
                        recoverable
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {scanResults.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between bg-white/90 dark:bg-slate-800/70 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-700/20 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg" />
                            <div>
                              <div className="text-gray-900 dark:text-white font-bold text-base">
                                {result.name}
                              </div>
                              <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                {result.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-900 dark:text-white font-bold text-base">
                              {formatBytes(result.size)}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">
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
    </div>
  );
};
