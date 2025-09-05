// EKD Clean - System Stats Grid Component
// Built by EKD Digital - Superior to CleanMyMac

import React from "react";
import { motion } from "framer-motion";
import { Cpu, HardDrive, Clock, Shield } from "lucide-react";
import { SystemInfo, ActivityItem } from "../../types";

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

interface SystemStatsGridProps {
  memoryUsage: MemoryUsage | null;
  systemInfo: SystemInfo | null;
  activityHistory: ActivityItem[];
  scanResults: any[];
  formatBytes: (bytes: number) => string;
  formatTimeAgo: (date: Date) => string;
  getTotalSize: () => number;
  getTotalFiles: () => number;
  isDarkMode?: boolean;
}

export const SystemStatsGrid: React.FC<SystemStatsGridProps> = ({
  memoryUsage,
  systemInfo,
  activityHistory,
  scanResults,
  formatBytes,
  formatTimeAgo,
  getTotalSize,
  getTotalFiles,
  isDarkMode = false,
}) => {
  const getMemoryStatus = () => {
    if (!memoryUsage) return { color: "gray", status: "Unknown" };
    if (memoryUsage.percentage < 60)
      return { color: "green", status: "Optimal" };
    if (memoryUsage.percentage < 85)
      return { color: "yellow", status: "Moderate" };
    return { color: "red", status: "Critical" };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* System Performance Card */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              System Performance
            </h3>
          </div>

          {memoryUsage ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span
                  className={`font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Memory Usage
                </span>
                <span
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {memoryUsage.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                    getMemoryStatus().color === "red"
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : getMemoryStatus().color === "yellow"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                  style={{ width: `${memoryUsage.percentage}%` }}
                />
              </div>

              <div className="bg-gray-50/70 rounded-2xl p-6 mt-4">
                <div
                  className={`text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Memory Details
                </div>
                <div
                  className={`font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {formatBytes(memoryUsage.used)} of{" "}
                  {formatBytes(memoryUsage.total)} used
                </div>
              </div>

              <div
                className={`inline-flex items-center px-4 py-2 rounded-2xl font-bold shadow-sm ${
                  getMemoryStatus().color === "red"
                    ? "bg-red-100 text-red-800"
                    : getMemoryStatus().color === "yellow"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {getMemoryStatus().status}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div
                className={`text-lg font-medium ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Loading...
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Storage Cleanup Card */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/30 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
              <HardDrive className="h-6 w-6 text-white" />
            </div>
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Storage Cleanup
            </h3>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Available to Clean
              </span>
              <span
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              >
                {scanResults.length > 0 ? formatBytes(getTotalSize()) : "—"}
              </span>
            </div>

            {scanResults.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-purple-50/70 rounded-2xl p-6">
                  <div className="text-gray-700 font-semibold">
                    {getTotalFiles().toLocaleString()} files ready for cleanup
                  </div>
                </div>
                <div className="flex items-center gap-3 font-bold text-emerald-700 bg-emerald-100/70 px-4 py-2 rounded-2xl shadow-sm">
                  <Shield className="h-4 w-4" />
                  100% Safe to Remove
                </div>
              </div>
            ) : (
              <div className="text-gray-500 font-medium bg-gray-50/70 rounded-2xl p-4">
                Run a scan to analyze your storage
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Card */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-white/90 to-emerald-50/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Activity
            </h3>
          </div>

          <div className="space-y-4 max-h-48 overflow-y-auto">
            {activityHistory.length > 0 ? (
              activityHistory.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-white/70 rounded-2xl p-5 hover:bg-white/90 transition-colors shadow-sm"
                >
                  <div
                    className={`w-4 h-4 rounded-full shadow-lg ${
                      item.status === "completed"
                        ? "bg-green-500 shadow-green-200"
                        : item.status === "running"
                          ? "bg-yellow-500 shadow-yellow-200"
                          : "bg-red-500 shadow-red-200"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </div>
                    <div
                      className={`text-sm truncate font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatTimeAgo(new Date(item.timestamp))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 bg-emerald-50/50 rounded-3xl">
                <Clock
                  className={`h-16 w-16 mx-auto mb-4 ${
                    isDarkMode ? "text-gray-500" : "text-gray-300"
                  }`}
                />
                <p
                  className={`font-bold text-lg mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  No recent activity
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Start a scan to see activity here
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
