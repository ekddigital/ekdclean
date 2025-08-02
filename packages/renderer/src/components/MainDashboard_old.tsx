// EKD Clean - Main Dashboard Layout
// Built by EKD Digital - Superior to CleanMyMac

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Trash2, HardDrive, Clock } from "lucide-react";
import { ScanResult, ActivityItem, SystemInfo } from "../types";
import { SoundManager } from "../utils/SoundManager";

interface MainDashboardProps {
  activeItem: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ activeItem }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);
  const soundManager = SoundManager.getInstance();

  // Load real system data on component mount
  useEffect(() => {
    loadSystemData();
    loadActivityHistory();
    loadMemoryUsage();

    // Refresh data periodically
    const interval = setInterval(() => {
      loadMemoryUsage();
      loadActivityHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const info = await window.electronAPI.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error("Failed to load system info:", error);
    }
  };

  const loadActivityHistory = async () => {
    try {
      const activity = await window.electronAPI.getRecentActivity();
      setActivityHistory(activity);
    } catch (error) {
      console.error("Failed to load activity history:", error);
    }
  };

  const loadMemoryUsage = async () => {
    try {
      const usage = await window.electronAPI.getMemoryUsage();
      setMemoryUsage(usage);
    } catch (error) {
      console.error("Failed to load memory usage:", error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanResults([]);
      soundManager.playScan();

      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Perform real scan
      const results = await window.electronAPI.scanSystem();

      clearInterval(progressInterval);
      setScanProgress(100);
      setScanResults(results);
      setIsScanning(false);
      soundManager.playSuccess();

      // Refresh activity after scan
      setTimeout(loadActivityHistory, 500);
    } catch (error) {
      console.error("Scan failed:", error);
      setIsScanning(false);
      soundManager.playError();
    }
  };

  const handleCleanFiles = async () => {
    if (scanResults.length === 0) return;

    try {
      soundManager.playClick();
      const cleanResult = await window.electronAPI.cleanFiles(scanResults);

      console.log("Clean result:", cleanResult);
      setScanResults([]);
      soundManager.playSuccess();

      // Refresh activity and memory usage
      setTimeout(() => {
        loadActivityHistory();
        loadMemoryUsage();
      }, 500);
    } catch (error) {
      console.error("Clean failed:", error);
      soundManager.playError();
    }
  };

  const getTotalSize = (): number => {
    return scanResults.reduce((total, result) => total + result.size, 0);
  };

  const getTotalFiles = (): number => {
    return scanResults.reduce((total, result) => total + result.files, 0);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Hero Header Section */}
      <div className="px-8 py-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-1">
              EKD Clean
            </h1>
            <p className="text-slate-400 text-sm">
              Superior system optimization • Built by EKD Digital
            </p>
          </div>
          <div className="flex items-center gap-4">
            {memoryUsage && (
              <div className="text-right">
                <div className="text-sm text-slate-400">Memory Usage</div>
                <div className="text-lg font-semibold text-white">
                  {memoryUsage.percentage.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Smart Scan Card */}
        <motion.div
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/40 rounded-xl p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Gold accent border */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  Smart Scan
                </h2>
                <p className="text-slate-400 text-sm">
                  {isScanning
                    ? "Analyzing your system for optimization opportunities..."
                    : "Scan for junk files, cache, and system optimization opportunities"}
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isScanning ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isScanning ? "Scanning..." : "Start Scan"}
                </motion.button>
                {scanResults.length > 0 && (
                  <motion.button
                    onClick={handleCleanFiles}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clean Now
                  </motion.button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {isScanning && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  {Math.round(scanProgress)}% complete
                </p>
              </motion.div>
            )}

            {/* Scan Results */}
            {scanResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">
                    Scan Results
                  </h3>
                  <div className="text-amber-400 font-semibold text-sm">
                    {getTotalFiles()} items • {formatBytes(getTotalSize())}{" "}
                    recoverable
                  </div>
                </div>

                <div className="space-y-2">
                  {scanResults.slice(0, 4).map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between bg-slate-700/20 rounded-md p-3 border border-slate-600/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${result.safe ? "bg-green-400" : "bg-yellow-400"}`}
                        />
                        <div>
                          <div className="text-white font-medium text-sm">
                            {result.name}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {result.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium text-sm">
                          {formatBytes(result.size)}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {result.files} files
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {scanResults.length > 4 && (
                    <div className="text-center py-2">
                      <span className="text-slate-400 text-xs">
                        +{scanResults.length - 4} more categories
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Memory Usage */}
          <motion.div
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/40 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Memory</h3>
            </div>

            {memoryUsage ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${memoryUsage.percentage}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{formatBytes(memoryUsage.used)}</span>
                    <span>{memoryUsage.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <div>Total: {formatBytes(memoryUsage.total)}</div>
                  <div>
                    Available:{" "}
                    {formatBytes(memoryUsage.total - memoryUsage.used)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="bg-slate-700/50 rounded-full h-2" />
                <div className="space-y-1">
                  <div className="bg-slate-600/50 rounded h-3 w-3/4" />
                  <div className="bg-slate-600/50 rounded h-3 w-1/2" />
                </div>
              </div>
            )}
          </motion.div>

          {/* System Info */}
          <motion.div
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/40 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3">
              System Info
            </h3>

            {systemInfo ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform</span>
                  <span className="text-white">{systemInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Arch</span>
                  <span className="text-white">{systemInfo.arch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cores</span>
                  <span className="text-white">{systemInfo.cpuCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">OS</span>
                  <span className="text-white">{systemInfo.osVersion}</span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="bg-slate-600/50 rounded h-3 w-16" />
                    <div className="bg-slate-600/50 rounded h-3 w-20" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/40 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Activity</h3>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {activityHistory.length > 0 ? (
                activityHistory.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === "completed"
                          ? "bg-green-400"
                          : item.status === "running"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {item.title}
                      </div>
                      <div className="text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="text-slate-500 text-xs">
                      {formatTimeAgo(new Date(item.timestamp))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-4">
                  <Clock className="h-6 w-6 mx-auto mb-1 opacity-30" />
                  <p className="text-xs">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
