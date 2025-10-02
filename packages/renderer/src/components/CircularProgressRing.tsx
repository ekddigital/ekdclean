// EKD Clean - Circular Progress Ring Component
// Built by EKD Digital

import React from "react";
import { motion } from "framer-motion";

interface CircularProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className = "",
  showPercentage = true,
  color = "#f59e0b", // amber-500
  backgroundColor = "#e5e7eb", // gray-200
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Indeterminate spinner variant
export const CircularSpinner: React.FC<{
  size?: number;
  strokeWidth?: number;
  color?: string;
}> = ({
  size = 120,
  strokeWidth = 8,
  color = "#f59e0b",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="animate-spin"
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.3}
          strokeDashoffset={0}
        />
      </svg>
    </div>
  );
};
