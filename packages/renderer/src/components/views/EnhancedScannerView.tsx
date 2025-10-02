// EKD Clean - Enhanced Scanner View
// Built by EKD Digital

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Trash2, HardDrive, Check, AlertTriangle, Archive } from "lucide-react";

interface ScanItem {
  id: string;
  path: string;
  sizeBytes: number;
  discoveredAt: string;
  category: string;
  reason: string;
  safeToDelete: boolean;
  confidence: number;
  metadata?: Record<string, any>;
}

interface EnhancedScannerViewProps {
  scannerId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const EnhancedScannerView: React.FC<EnhancedScannerViewProps> = ({
  scannerId,
  title,
  description,
  icon,
}) => {
  const [scanItems, setScanItems] = useState<ScanItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isCleaning, setIsCleaning] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanItems([]);

      // Listen for progress
      window.electronAPI.onScannerProgress((data) => {
        if (data.scannerId === scannerId) {
          setScanProgress(data.progress);
        }
      });

      const items = await window.electronAPI.runScanner(scannerId, {
        dryRun: true,
      });

      setScanItems(items);
      
      // Auto-select safe items
      const safeItems = new Set(
        items.filter(item => item.safeToDelete && item.confidence > 0.8)
          .map(item => item.id)
      );
      setSelectedItems(safeItems);
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const handleClean = async () => {
    try {
      setIsCleaning(true);
      const itemsToClean = scanItems.filter(item => selectedItems.has(item.id));

      const result = await window.electronAPI.cleanItems(scannerId, itemsToClean, {
        quarantine: true,
        backup: true,
      });

      // Refresh scan after cleaning
      if (result.success) {
        await handleScan();
      }
    } catch (error) {
      console.error("Clean failed:", error);
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const toggleAll = () => {
    if (selectedItems.size === scanItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(scanItems.map(item => item.id)));
    }
  };

  const getTotalSize = () => {
    return scanItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.sizeBytes, 0);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-100";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div
      className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-auto"
      style={{ marginLeft: "260px" }}
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 mx-6 mt-6 rounded-t-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-8">
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            onClick={handleScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-3xl font-bold text-lg flex items-center gap-3 hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="h-6 w-6" />
            {isScanning ? "Scanning..." : `Scan ${title}`}
          </motion.button>

          {scanItems.length > 0 && selectedItems.size > 0 && (
            <motion.button
              onClick={handleClean}
              disabled={isCleaning}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-3xl font-bold text-lg flex items-center gap-3 hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Archive className="h-6 w-6" />
              {isCleaning ? "Cleaning..." : `Quarantine ${selectedItems.size} Items`}
            </motion.button>
          )}
        </div>

        {/* Progress Bar */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-xl mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">
                Scanning in progress...
              </span>
              <span className="text-lg font-bold text-amber-600">
                {scanProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Results */}
        {scanItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/80 to-gray-50/80 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Found {scanItems.length} Items
                </h3>
                <button
                  onClick={toggleAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedItems.size === scanItems.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 px-6 py-3 rounded-2xl font-bold shadow-lg">
                {selectedItems.size} selected • {formatBytes(getTotalSize())} recoverable
              </div>
            </div>

            <div className="grid gap-4">
              {scanItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="mt-1 w-5 h-5 rounded border-gray-300"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900">
                              {item.path.split("/").pop() || item.path}
                            </h4>
                            {item.safeToDelete && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            {!item.safeToDelete && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.reason}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            {item.path}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getConfidenceColor(item.confidence)}`}>
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatBytes(item.sizeBytes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {scanItems.length === 0 && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/80 to-gray-50/80 rounded-3xl p-16 border border-gray-200/50 backdrop-blur-sm shadow-xl text-center"
          >
            <HardDrive className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Scan
            </h3>
            <p className="text-gray-600 text-lg">
              Click the scan button to analyze your system for {title.toLowerCase()}.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
