// EKD Clean - Main Dashboard Layout
// Built by EKD Digital - Superior to CleanMyMac

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  HardDrive,
  Clock,
  ChevronRight,
} from "lucide-react";
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
      soundManager.playStartScan();

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
      soundManager.playComplete();

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
      soundManager.playStartClean();
      const cleanResult = await window.electronAPI.cleanFiles(scanResults);

      console.log("Clean result:", cleanResult);
      setScanResults([]);
      soundManager.playComplete();

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
    <div className="h-full p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">EKD Clean</h1>
        <p className="text-slate-400 text-lg">
          Superior system optimization • Built by EKD Digital
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8 h-[calc(100%-140px)]">
        {/* Smart Scan - Main Hero */}
        <motion.div
          className="col-span-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Smart Scan
                </h2>
                <p className="text-slate-400">
                  {isScanning
                    ? "Analyzing your system..."
                    : "Scan for junk files and optimization opportunities"}
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-5 w-5" />
                    Clean
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
                <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {Math.round(scanProgress)}% complete
                </p>
              </motion.div>
            )}

            {/* Scan Results */}
            {scanResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Scan Results
                  </h3>
                  <div className="text-amber-400 font-semibold">
                    {getTotalFiles()} items • {formatBytes(getTotalSize())} can
                    be recovered
                  </div>
                </div>

                <div className="space-y-3">
                  {scanResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${result.safe ? "bg-green-400" : "bg-yellow-400"}`}
                        />
                        <div>
                          <div className="text-white font-medium">
                            {result.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {result.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatBytes(result.size)}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {result.files} files
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          className="col-span-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="h-6 w-6 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Memory Usage</h3>
          </div>

          {memoryUsage ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-slate-700/50 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${memoryUsage.percentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-400 mt-2">
                  <span>{formatBytes(memoryUsage.used)} used</span>
                  <span>{memoryUsage.percentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Memory</span>
                  <span className="text-white">
                    {formatBytes(memoryUsage.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Available</span>
                  <span className="text-white">
                    {formatBytes(memoryUsage.total - memoryUsage.used)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="bg-slate-700/50 rounded-full h-4" />
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                <div className="bg-slate-600/50 rounded h-4" />
                <div className="bg-slate-600/50 rounded h-4" />
              </div>
            </div>
          )}
        </motion.div>

        {/* System Info */}
        <motion.div
          className="col-span-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            System Information
          </h3>

          {systemInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Platform</span>
                <span className="text-white">
                  {systemInfo.platform} {systemInfo.arch}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OS Version</span>
                <span className="text-white">{systemInfo.osVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPU Cores</span>
                <span className="text-white">{systemInfo.cpuCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Node.js</span>
                <span className="text-white">{systemInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Electron</span>
                <span className="text-white">{systemInfo.electronVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">App Version</span>
                <span className="text-white">v{systemInfo.appVersion}</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="bg-slate-600/50 rounded h-4 w-24" />
                  <div className="bg-slate-600/50 rounded h-4 w-32" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="col-span-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activityHistory.length > 0 ? (
              activityHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 border border-slate-600/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "completed"
                          ? "bg-green-400"
                          : item.status === "running"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                      }`}
                    />
                    <div>
                      <div className="text-white font-medium text-sm">
                        {item.title}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-xs">
                      {formatTimeAgo(new Date(item.timestamp))}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 ml-auto" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
