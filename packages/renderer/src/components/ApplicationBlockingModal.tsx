// EKD Clean - Application Blocking Modal
// Built by EKD Digital

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ApplicationInfo {
  name: string;
  processId: number;
  bundleId?: string;
  path: string;
  usingFiles: string[];
  canForceQuit: boolean;
  isSystemCritical: boolean;
}

export interface ApplicationBlockingPrompt {
  applications: ApplicationInfo[];
  affectedPaths: string[];
  estimatedSpaceToFree: number;
  message: string;
  canForceClose: boolean;
}

interface ApplicationBlockingModalProps {
  isOpen: boolean;
  prompt: ApplicationBlockingPrompt | null;
  onClose: () => void;
  onCloseApplications: (
    apps: ApplicationInfo[],
    force: boolean
  ) => Promise<void>;
  onSkip: () => void;
}

export const ApplicationBlockingModal: React.FC<
  ApplicationBlockingModalProps
> = ({ isOpen, prompt, onClose, onCloseApplications, onSkip }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [closingApp, setClosingApp] = useState<string | null>(null);

  if (!prompt) return null;

  const handleCloseGracefully = async () => {
    setIsClosing(true);
    try {
      await onCloseApplications(prompt.applications, false);
    } finally {
      setIsClosing(false);
    }
  };

  const handleForceClose = async () => {
    if (!prompt.canForceClose) return;

    setIsClosing(true);
    try {
      await onCloseApplications(prompt.applications, true);
    } finally {
      setIsClosing(false);
    }
  };

  const handleCloseIndividual = async (app: ApplicationInfo) => {
    setClosingApp(app.name);
    try {
      await onCloseApplications([app], false);
    } finally {
      setClosingApp(null);
    }
  };

  const spaceMB = (prompt.estimatedSpaceToFree / 1024 / 1024).toFixed(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="relative z-[999999] flex items-center justify-center min-h-full p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden relative pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-amber-600 dark:text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Applications Are Using Files
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {spaceMB} MB could be freed up
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 max-h-96 overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {prompt.message}
                </p>

                {/* Applications List */}
                <div className="space-y-3">
                  {prompt.applications.map((app) => (
                    <motion.div
                      key={app.processId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {app.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {app.usingFiles.length} file
                            {app.usingFiles.length !== 1 ? "s" : ""} in use
                          </p>
                        </div>
                      </div>

                      {app.canForceQuit && !app.isSystemCritical && (
                        <button
                          onClick={() => handleCloseIndividual(app)}
                          disabled={closingApp === app.name}
                          className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/50 disabled:opacity-50 transition-colors"
                        >
                          {closingApp === app.name ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              <span>Closing...</span>
                            </div>
                          ) : (
                            "Close"
                          )}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {prompt.affectedPaths.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                      View affected files ({prompt.affectedPaths.length})
                    </summary>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {prompt.affectedPaths.slice(0, 5).map((path, index) => (
                        <p
                          key={index}
                          className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate"
                        >
                          {path}
                        </p>
                      ))}
                      {prompt.affectedPaths.length > 5 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          ... and {prompt.affectedPaths.length - 5} more files
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col space-y-3">
                  {/* Primary Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCloseGracefully}
                      disabled={isClosing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      {isClosing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Closing Apps...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Close Applications</span>
                        </>
                      )}
                    </button>

                    {prompt.canForceClose && (
                      <button
                        onClick={handleForceClose}
                        disabled={isClosing}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>Force Close</span>
                      </button>
                    )}
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={onSkip}
                      className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium py-2 px-4 transition-colors text-sm"
                    >
                      Skip for now
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium py-2 px-4 transition-colors text-sm"
                    >
                      Cancel cleaning
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
