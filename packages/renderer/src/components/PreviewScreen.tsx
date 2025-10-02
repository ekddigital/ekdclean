// EKD Clean - Preview Screen Component
// Built by EKD Digital

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  FileText,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";

export type PreviewCategory = {
  id: string;
  name: string;
  description: string;
  items: PreviewItem[];
  totalSize: number;
  recommended: boolean;
  icon?: React.ReactNode;
};

export type PreviewItem = {
  id: string;
  path: string;
  size: number;
  category: string;
  reason: string;
  safeToDelete: boolean;
  confidence: number;
  metadata?: {
    ageInDays?: number;
    lastModified?: Date;
    type?: string;
  };
};

export type PreviewScreenProps = {
  categories: PreviewCategory[];
  onClean: (selectedItems: PreviewItem[]) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
};

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  categories,
  onClean,
  onCancel,
  isDarkMode = false,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories.filter((cat) => cat.recommended).map((cat) => cat.id))
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Calculate totals
  const {
    totalItems,
    totalSize: _totalSize,
    selectedCount,
    selectedSize,
  } = useMemo(() => {
    let totalItems = 0;
    let totalSize = 0;
    let selectedCount = 0;
    let selectedSize = 0;

    categories.forEach((category) => {
      totalItems += category.items.length;
      totalSize += category.totalSize;

      if (selectedCategories.has(category.id)) {
        category.items.forEach((item) => {
          if (!selectedItems.has(item.id) || selectedItems.has(item.id)) {
            selectedCount++;
            selectedSize += item.size;
          }
        });
      } else {
        category.items.forEach((item) => {
          if (selectedItems.has(item.id)) {
            selectedCount++;
            selectedSize += item.size;
          }
        });
      }
    });

    return { totalItems, totalSize, selectedCount, selectedSize };
  }, [categories, selectedCategories, selectedItems]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
      // Unselect all items in this category
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        category.items.forEach((item) => {
          selectedItems.delete(item.id);
        });
        setSelectedItems(new Set(selectedItems));
      }
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const toggleItem = (_categoryId: string, itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleClean = () => {
    const itemsToClean: PreviewItem[] = [];
    categories.forEach((category) => {
      if (selectedCategories.has(category.id)) {
        itemsToClean.push(...category.items);
      } else {
        category.items.forEach((item) => {
          if (selectedItems.has(item.id)) {
            itemsToClean.push(item);
          }
        });
      }
    });
    onClean(itemsToClean);
  };

  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const mutedColor = isDarkMode ? "text-gray-400" : "text-gray-600";
  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";
  const hoverBg = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className={`p-6 border-b ${borderColor}`}>
        <h1 className={`text-2xl font-bold ${textColor} mb-2`}>Review Items</h1>
        <p className={mutedColor}>
          Select items to clean. Recommended items are pre-selected for safety.
        </p>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {categories.map((category, index) => {
          const isExpanded = expandedCategories.has(category.id);
          const isCategorySelected = selectedCategories.has(category.id);
          const categoryItemCount = category.items.length;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${bgColor} rounded-xl border ${borderColor} overflow-hidden`}
            >
              {/* Category Header */}
              <div
                className={`p-4 flex items-center gap-4 cursor-pointer ${hoverBg} transition-colors`}
                onClick={() => toggleCategory(category.id)}
              >
                <div
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.id);
                  }}
                >
                  {isCategorySelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-shrink-0 text-blue-500">
                  {category.icon || <FileText className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${textColor}`}>
                      {category.name}
                    </h3>
                    {category.recommended && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${mutedColor} truncate`}>
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${textColor}`}>
                      {categoryItemCount}{" "}
                      {categoryItemCount === 1 ? "item" : "items"}
                    </div>
                    <div className={`text-xs ${mutedColor}`}>
                      {formatSize(category.totalSize)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(category.id);
                    }}
                    className={`p-1 rounded-lg ${hoverBg}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Category Items (Expandable) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`border-t ${borderColor}`}
                  >
                    <div className="max-h-96 overflow-y-auto">
                      {category.items.map((item, itemIndex) => {
                        const isSelected =
                          isCategorySelected || selectedItems.has(item.id);

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: itemIndex * 0.02 }}
                            className={`p-3 flex items-start gap-3 ${hoverBg} cursor-pointer ${
                              itemIndex > 0 ? `border-t ${borderColor}` : ""
                            }`}
                            onClick={() => toggleItem(category.id, item.id)}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code
                                  className={`text-xs ${textColor} font-mono truncate flex-1`}
                                >
                                  {item.path}
                                </code>
                                {!item.safeToDelete && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className={mutedColor}>
                                  {formatSize(item.size)}
                                </span>
                                {item.metadata?.ageInDays && (
                                  <span
                                    className={`flex items-center gap-1 ${mutedColor}`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    {item.metadata.ageInDays}d old
                                  </span>
                                )}
                                <span className={mutedColor}>
                                  {Math.round(item.confidence * 100)}%
                                  confidence
                                </span>
                              </div>
                              <p className={`text-xs ${mutedColor} mt-1`}>
                                {item.reason}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer / Action Bar */}
      <div className={`p-6 border-t ${borderColor} ${bgColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-sm ${mutedColor}`}>
              Selected: {selectedCount} of {totalItems} items
            </div>
            <div className={`text-2xl font-bold ${textColor}`}>
              {formatSize(selectedSize)}
            </div>
            <div className={`text-xs ${mutedColor}`}>will be freed up</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`px-6 py-3 rounded-xl font-semibold ${mutedColor} ${hoverBg} transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handleClean}
              disabled={selectedCount === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Clean {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </button>
          </div>
        </div>

        {/* Safety Notice */}
        <div
          className={`flex items-start gap-2 p-3 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"} ${isDarkMode ? "border-blue-800" : "border-blue-200"} border`}
        >
          <Info
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          />
          <p
            className={`text-xs ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}
          >
            All items will be moved to quarantine first. You can restore them
            from Settings if needed.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
