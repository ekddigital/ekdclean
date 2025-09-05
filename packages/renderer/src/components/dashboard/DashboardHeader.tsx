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
      className={`backdrop-blur-xl border-b px-8 py-6 ${
        isDarkMode
          ? "bg-gray-900/80 border-gray-700/50"
          : "bg-white/80 border-gray-200/50"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo Section */}
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

        {/* Memory Status */}
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
  );
};
