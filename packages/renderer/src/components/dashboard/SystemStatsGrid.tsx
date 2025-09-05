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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* System Performance Card */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-3xl blur-xl" />
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              System Performance
            </h3>
          </div>

          {memoryUsage ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Memory Usage</span>
                <span className="text-xl font-bold text-gray-900">
                  {memoryUsage.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    getMemoryStatus().color === "red"
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : getMemoryStatus().color === "yellow"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                  style={{ width: `${memoryUsage.percentage}%` }}
                />
              </div>

              <div className="text-sm text-gray-500">
                {formatBytes(memoryUsage.used)} of{" "}
                {formatBytes(memoryUsage.total)} used
              </div>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  getMemoryStatus().color === "red"
                    ? "bg-red-100 text-red-700"
                    : getMemoryStatus().color === "yellow"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {getMemoryStatus().status}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">Loading...</div>
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
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Storage Cleanup</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">
                Available to Clean
              </span>
              <span className="text-xl font-bold text-purple-600">
                {scanResults.length > 0 ? formatBytes(getTotalSize()) : "—"}
              </span>
            </div>

            {scanResults.length > 0 ? (
              <>
                <div className="text-sm text-gray-600">
                  {getTotalFiles().toLocaleString()} files ready for cleanup
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <Shield className="h-3 w-3" />
                  100% Safe to Remove
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
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
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
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
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-gray-400 text-sm">
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
