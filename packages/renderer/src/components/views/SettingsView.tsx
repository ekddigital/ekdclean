// EKD Clean - Settings View
// Built by EKD Digital

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Plus, X } from "lucide-react";

interface WhitelistRule {
  id: string;
  pattern: string;
  type: "path" | "glob" | "hash";
  reason: string;
  addedAt: string;
}

export const SettingsView: React.FC = () => {
  const [whitelistRules, setWhitelistRules] = useState<WhitelistRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    pattern: "",
    type: "path" as "path" | "glob" | "hash",
    reason: "",
  });

  useEffect(() => {
    loadWhitelistRules();
  }, []);

  const loadWhitelistRules = async () => {
    try {
      setIsLoading(true);
      const rules = await window.electronAPI.getWhitelistRules();
      setWhitelistRules(rules);
    } catch (error) {
      console.error("Failed to load whitelist rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.pattern || !newRule.reason) return;

    try {
      await window.electronAPI.addWhitelistRule(
        newRule.pattern,
        newRule.type,
        newRule.reason
      );
      setNewRule({ pattern: "", type: "path", reason: "" });
      setShowAddForm(false);
      await loadWhitelistRules();
    } catch (error) {
      console.error("Failed to add rule:", error);
    }
  };

  const handleRemoveRule = async (ruleId: string) => {
    try {
      await window.electronAPI.removeWhitelistRule(ruleId);
      await loadWhitelistRules();
    } catch (error) {
      console.error("Failed to remove rule:", error);
    }
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 text-sm">
                Manage exclusions and preferences
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4" />
            Add Exclusion
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Add Rule Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/80 to-gray-50/80 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm shadow-xl mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Add New Exclusion Rule
            </h3>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newRule.type}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      type: e.target.value as "path" | "glob" | "hash",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                >
                  <option value="path">Exact Path</option>
                  <option value="glob">Glob Pattern</option>
                  <option value="hash">File Hash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern
                </label>
                <input
                  type="text"
                  value={newRule.pattern}
                  onChange={(e) =>
                    setNewRule({ ...newRule, pattern: e.target.value })
                  }
                  placeholder={
                    newRule.type === "path"
                      ? "/Users/username/important-folder"
                      : newRule.type === "glob"
                      ? "**/*.important"
                      : "sha256:abc123..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={newRule.reason}
                  onChange={(e) =>
                    setNewRule({ ...newRule, reason: e.target.value })
                  }
                  placeholder="Why should this be excluded?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAddRule}
                  disabled={!newRule.pattern || !newRule.reason}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Rule
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Whitelist Rules */}
        <div className="bg-gradient-to-br from-white/80 to-gray-50/80 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Exclusion Rules ({whitelistRules.length})
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading rules...</p>
              </div>
            </div>
          ) : whitelistRules.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No exclusion rules defined yet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Add rules to protect important files from being cleaned.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {whitelistRules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold uppercase">
                          {rule.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Added {formatDate(rule.addedAt)}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 mb-1 font-mono">
                        {rule.pattern}
                      </p>
                      <p className="text-sm text-gray-600">{rule.reason}</p>
                    </div>

                    <motion.button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="ml-4 p-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
