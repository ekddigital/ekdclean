// EKD Clean - Premium Dashboard Layout
// Built by EKD Digital - Superior to CleanMyMac

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Trash2,
  HardDrive,
  Clock,
  Zap,
  Shield,
  Activity,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { ScanResult, ActivityItem, SystemInfo } from "../types";
import { SoundManager } from "../utils/SoundManager";

interface MainDashboardProps {
  activeItem: string;
  isDarkMode?: boolean;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  activeItem,
  isDarkMode = false,
}) => {
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

  const getMemoryStatus = () => {
    if (!memoryUsage) return { color: "gray", status: "Unknown" };
    if (memoryUsage.percentage < 60)
      return { color: "green", status: "Optimal" };
    if (memoryUsage.percentage < 85)
      return { color: "yellow", status: "Moderate" };
    return { color: "red", status: "Critical" };
  };

  return (
    <div
      className={`h-full overflow-y-auto ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Premium Header */}
      <div
        className={`backdrop-blur-xl border-b px-8 py-6 ${
          isDarkMode
            ? "bg-gray-900/80 border-gray-700/50"
            : "bg-white/80 border-gray-200/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  EKD Clean
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  Superior system optimization • Built by EKD Digital
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {memoryUsage && (
              <div className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-2 border border-gray-200/50">
                <Activity className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Memory Usage
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      getMemoryStatus().color === "red"
                        ? "text-red-600"
                        : getMemoryStatus().color === "yellow"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {memoryUsage.percentage.toFixed(1)}% •{" "}
                    {getMemoryStatus().status}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Hero Smart Scan Section */}
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
                      {isScanning
                        ? "Intelligently analyzing your system for safe optimization opportunities..."
                        : "Advanced smart analysis to identify only safe cleanup targets - never touches Downloads, Documents, or personal files"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isScanning ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                    {isScanning ? "Scanning..." : "Start Scan"}
                  </motion.button>

                  {scanResults.length > 0 && (
                    <motion.button
                      onClick={handleCleanFiles}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Trash2 className="h-5 w-5" />
                      Clean Now
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              {isScanning && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-600 text-sm font-medium">
                      {Math.round(scanProgress)}% complete
                    </p>
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Analyzing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Beautiful Scan Results */}
              {scanResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 rounded-2xl p-6 border border-gray-200/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Scan Results
                    </h3>
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-4 py-2 rounded-xl font-semibold text-sm">
                      {getTotalFiles()} items • {formatBytes(getTotalSize())}{" "}
                      recoverable
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {scanResults.slice(0, 4).map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between bg-white/80 rounded-xl p-4 border border-gray-200/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              result.safe
                                ? "bg-green-500 shadow-green-200 shadow-lg"
                                : "bg-yellow-500 shadow-yellow-200 shadow-lg"
                            }`}
                          />
                          <div>
                            <div className="text-gray-900 font-semibold text-sm">
                              {result.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {result.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-gray-900 font-bold text-sm">
                              {formatBytes(result.size)}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {result.files} files
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                    {scanResults.length > 4 && (
                      <div className="text-center py-3">
                        <span className="text-gray-500 text-sm font-medium">
                          +{scanResults.length - 4} more categories to clean
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Memory Usage Card */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <HardDrive className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Memory Usage
                </h3>
              </div>

              {memoryUsage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="bg-gray-200/50 rounded-full h-4 overflow-hidden shadow-inner">
                      <motion.div
                        className={`h-full rounded-full shadow-sm ${
                          getMemoryStatus().color === "red"
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : getMemoryStatus().color === "yellow"
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${memoryUsage.percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 text-sm font-medium">
                        {formatBytes(memoryUsage.used)} used
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          getMemoryStatus().color === "red"
                            ? "text-red-600"
                            : getMemoryStatus().color === "yellow"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {memoryUsage.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        Total Memory
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {formatBytes(memoryUsage.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        Available
                      </span>
                      <span className="text-green-600 font-semibold">
                        {formatBytes(memoryUsage.total - memoryUsage.used)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200/50 rounded-full h-4" />
                  <div className="bg-gray-100/50 rounded-xl p-4 space-y-2">
                    <div className="bg-gray-200/50 rounded h-4" />
                    <div className="bg-gray-200/50 rounded h-4 w-3/4" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Info Card */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-pink-100/30 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">System Info</h3>
              </div>

              {systemInfo ? (
                <div className="space-y-3">
                  {[
                    {
                      label: "Platform",
                      value: systemInfo.platform,
                      icon: "🖥️",
                    },
                    {
                      label: "Architecture",
                      value: systemInfo.arch,
                      icon: "⚙️",
                    },
                    {
                      label: "CPU Cores",
                      value: systemInfo.cpuCount.toString(),
                      icon: "💎",
                    },
                    {
                      label: "OS Version",
                      value: systemInfo.osVersion,
                      icon: "🔧",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between bg-gray-50/50 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-gray-600 font-medium text-sm">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold text-sm">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100/50 rounded-xl p-3 flex justify-between"
                    >
                      <div className="bg-gray-200/50 rounded h-4 w-20" />
                      <div className="bg-gray-200/50 rounded h-4 w-24" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Activity Card */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-3 max-h-40 overflow-y-auto">
                {activityHistory.length > 0 ? (
                  activityHistory.slice(0, 4).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 bg-gray-50/50 rounded-xl p-3 hover:bg-gray-100/50 transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full shadow-lg ${
                          item.status === "completed"
                            ? "bg-green-500 shadow-green-200"
                            : item.status === "running"
                              ? "bg-yellow-500 shadow-yellow-200"
                              : "bg-red-500 shadow-red-200"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 font-semibold text-sm truncate">
                          {item.title}
                        </div>
                        <div className="text-gray-500 text-xs truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs font-medium">
                        {formatTimeAgo(new Date(item.timestamp))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                      No recent activity
                    </p>
                    <p className="text-gray-400 text-sm">
                      Start a scan to see activity here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
