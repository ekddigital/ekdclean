// EKD Clean - Scan Results List Component
// Built by EKD Digital - Superior to CleanMyMac

import React from "react";
import { motion } from "framer-motion";
import { Trash2, HardDrive, Shield } from "lucide-react";

interface ScanResult {
  id: string;
  name: string;
  type: string;
  size: number;
  files: number;
  description: string;
}

interface ScanResultsListProps {
  scanResults: ScanResult[];
  formatBytes: (bytes: number) => string;
  getTotalSize: () => number;
  getTotalFiles: () => number;
}

export const ScanResultsList: React.FC<ScanResultsListProps> = ({
  scanResults,
  formatBytes,
  getTotalSize,
  getTotalFiles,
}) => {
  if (scanResults.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    const iconClass = "h-6 w-6 text-white";
    switch (type) {
      case "cache":
        return <HardDrive className={iconClass} />;
      case "temp":
        return <HardDrive className={iconClass} />;
      case "log":
        return <HardDrive className={iconClass} />;
      default:
        return <HardDrive className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cache":
        return "from-blue-400 to-indigo-500";
      case "temp":
        return "from-orange-400 to-red-500";
      case "log":
        return "from-purple-400 to-violet-500";
      default:
        return "from-gray-400 to-slate-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-3xl blur-2xl" />

      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-8 py-6 border-b border-red-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Trash2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  Ready for Cleanup
                </h3>
                <p className="text-sm font-semibold text-red-600">
                  {formatBytes(getTotalSize())} •{" "}
                  {getTotalFiles().toLocaleString()} files • 100% Safe
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-red-600">
                {formatBytes(getTotalSize())}
              </div>
              <div className="text-sm font-bold text-gray-600">
                Total space to free
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="divide-y divide-gray-100">
          {scanResults.map((result, index) => (
            <motion.div
              key={result.id}
              className="px-8 py-6 hover:bg-gray-50/50 transition-all duration-300"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${getTypeColor(result.type)}`}
                  >
                    {getTypeIcon(result.type)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">
                      {result.name}
                    </h4>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      {result.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <Shield className="h-3 w-3" />
                        Safe to remove
                      </div>
                      <div className="text-xs font-semibold text-gray-500">
                        {result.files.toLocaleString()} files
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-red-600 mb-1">
                    {formatBytes(result.size)}
                  </div>
                  <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {result.type.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
