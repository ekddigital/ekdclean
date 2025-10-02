// EKD Clean - Quarantine Management View
// Built by EKD Digital

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Archive, RotateCcw, Trash2, Clock, HardDrive } from "lucide-react";

interface QuarantineItem {
  id: string;
  originalPath: string;
  quarantinePath: string;
  size: number;
  checksum: string;
  timestamp: string;
  category: string;
  metadata: Record<string, any>;
}

export const QuarantineView: React.FC = () => {
  const [quarantineItems, setQuarantineItems] = useState<QuarantineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadQuarantineItems();
  }, []);

  const loadQuarantineItems = async () => {
    try {
      setIsLoading(true);
      const items = await window.electronAPI.getQuarantineItems();
      setQuarantineItems(items);
    } catch (error) {
      console.error("Failed to load quarantine items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleRestore = async (quarantineId: string) => {
    try {
      const success = await window.electronAPI.restoreQuarantineItem(quarantineId);
      if (success) {
        await loadQuarantineItems();
      }
    } catch (error) {
      console.error("Failed to restore item:", error);
    }
  };

  const handleClearOld = async (days: number) => {
    try {
      await window.electronAPI.clearQuarantine(days);
      await loadQuarantineItems();
    } catch (error) {
      console.error("Failed to clear quarantine:", error);
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

  const getTotalSize = () => {
    return quarantineItems.reduce((sum, item) => sum + item.size, 0);
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quarantine</h1>
              <p className="text-gray-600 text-sm">
                {quarantineItems.length} items • {formatBytes(getTotalSize())}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              onClick={() => handleClearOld(30)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="h-4 w-4" />
              Clear Old (30+ days)
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading quarantine items...</p>
            </div>
          </div>
        ) : quarantineItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/80 to-gray-50/80 rounded-3xl p-16 border border-gray-200/50 backdrop-blur-sm shadow-xl text-center"
          >
            <Archive className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Quarantine is Empty
            </h3>
            <p className="text-gray-600 text-lg">
              Files moved to quarantine will appear here for safe restoration.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {quarantineItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all"
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
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.originalPath.split("/").pop()}
                        </h4>
                        <p className="text-sm text-gray-600 font-mono">
                          {item.originalPath}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleRestore(item.id)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-4 w-4" />
                        {formatBytes(item.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
