// EKD Clean - Coming Soon View
// Built by EKD Digital

import React from "react";
import { motion } from "framer-motion";
import { Wrench, Zap, ArrowLeft } from "lucide-react";

interface ComingSoonViewProps {
  title: string;
  description: string;
  icon: string;
  onBack: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  title,
  description,
  icon,
  onBack,
}) => {
  return (
    <div
      className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden"
      style={{ marginLeft: "260px" }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Smart Scan</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
              {title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {description}
            </p>
          </motion.div>

          <motion.div
            className="bg-white/60 rounded-2xl p-6 border border-gray-200/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wrench className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Coming Soon</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              This feature is currently under development. We're working hard to
              bring you the best system optimization experience.
            </p>

            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                EKD Digital - Superior to CleanMyMac
              </span>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={onBack}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-5 w-5" />
              Return to Smart Scan
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
