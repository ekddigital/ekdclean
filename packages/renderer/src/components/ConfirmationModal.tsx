// EKD Clean - Confirmation Modal Component
// Built by EKD Digital

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";

export type ConfirmationType = "warning" | "danger" | "info";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  requireTypedConfirmation?: boolean;
  confirmationPhrase?: string;
  itemCount?: number;
  estimatedSize?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireTypedConfirmation = false,
  confirmationPhrase = "DELETE",
  itemCount,
  estimatedSize,
}) => {
  const [typedText, setTypedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const canConfirm = requireTypedConfirmation
    ? typedText === confirmationPhrase
    : true;

  const handleConfirm = async () => {
    if (!canConfirm || isProcessing) return;

    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      setTypedText("");
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setTypedText("");
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-amber-600" />;
      case "info":
        return <Info className="w-12 h-12 text-blue-600" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">{getIcon()}</div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
                {title}
              </h2>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                {message}
              </p>

              {/* Statistics (if provided) */}
              {(itemCount !== undefined || estimatedSize) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    {itemCount !== undefined && (
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {itemCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {itemCount === 1 ? "Item" : "Items"}
                        </div>
                      </div>
                    )}
                    {estimatedSize && (
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {estimatedSize}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Size
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Typed confirmation (for destructive actions) */}
              {requireTypedConfirmation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type{" "}
                    <span className="font-mono font-bold">
                      {confirmationPhrase}
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    placeholder={confirmationPhrase}
                    autoComplete="off"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!canConfirm || isProcessing}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Quick confirmation hook
export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    config: Partial<ConfirmationModalProps>;
    resolver?: (confirmed: boolean) => void;
  }>({
    isOpen: false,
    config: {},
  });

  const confirm = (
    config: Partial<ConfirmationModalProps>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationState({
        isOpen: true,
        config,
        resolver: resolve,
      });
    });
  };

  const handleConfirm = () => {
    confirmationState.resolver?.(true);
    setConfirmationState({ isOpen: false, config: {} });
  };

  const handleClose = () => {
    confirmationState.resolver?.(false);
    setConfirmationState({ isOpen: false, config: {} });
  };

  return {
    confirm,
    ConfirmationModal: () => (
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmationState.config.title || "Confirm Action"}
        message={confirmationState.config.message || "Are you sure?"}
        {...confirmationState.config}
      />
    ),
  };
};
