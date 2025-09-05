// EKD Clean - Dashboard Header Component
// Built by EKD Digital - Superior to CleanMyMac

import React from "react";
import { Zap, Activity } from "lucide-react";

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

interface DashboardHeaderProps {
  memoryUsage: MemoryUsage | null;
  isDarkMode?: boolean;
  formatBytes: (bytes: number) => string;
  getMemoryStatus: () => { color: string; status: string };
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  memoryUsage,
  isDarkMode = false,
  formatBytes,
  getMemoryStatus,
}) => {
  return (
    <div
      className={`backdrop-blur-xl border-b rounded-tl-3xl px-6 py-6 mx-6 mt-6 mb-2 ${
        isDarkMode
          ? "bg-gray-900/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      }`}
      style={{
        borderRadius: "1.5rem 1.5rem 0 0",
        boxShadow:
          "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-amber-300" : "text-amber-700"
                }`}
              >
                EKD Clean
              </h1>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Superior system optimization • Built by EKD Digital
              </p>
            </div>
          </div>
        </div>

        {/* Memory Status */}
        <div className="flex items-center gap-6">
          {memoryUsage && (
            <div
              className={`flex items-center gap-4 backdrop-blur-sm rounded-2xl px-6 py-3 border shadow-lg ${
                isDarkMode
                  ? "bg-gray-800/70 border-gray-600/50"
                  : "bg-white/70 border-gray-200/50"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <div
                  className={`text-xs font-medium mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Memory Usage
                </div>
                <div
                  className={`text-sm font-bold ${
                    getMemoryStatus().color === "red"
                      ? isDarkMode
                        ? "text-red-400"
                        : "text-red-600"
                      : getMemoryStatus().color === "yellow"
                        ? isDarkMode
                          ? "text-yellow-400"
                          : "text-yellow-600"
                        : isDarkMode
                          ? "text-green-400"
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
  );
};
