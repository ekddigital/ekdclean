// EKD Clean - Animated Components Library
// Built by EKD Digital - Beyond CleanMyMac

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  glassEffects,
  cardAnimations,
  buttonAnimations,
  progressAnimations,
  spinnerAnimations,
  ANIMATION_CONFIG,
} from "./index";

// 🌟 Animated Glass Card
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "card" | "button" | "panel";
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = "",
  onClick,
  variant = "card",
}) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={glassEffects[variant]}
      variants={cardAnimations}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      layout
    >
      {children}
    </motion.div>
  );
};

// ⚡ Supercharged Button
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const baseStyles =
    "relative px-6 py-3 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-500 to-purple-600 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 focus:ring-gray-500",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-600 text-white focus:ring-red-500",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 text-white focus:ring-green-500",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      variants={buttonAnimations}
      initial="rest"
      animate={loading ? "loading" : "rest"}
      whileHover={!disabled && !loading ? "hover" : "rest"}
      whileTap={!disabled && !loading ? "tap" : "rest"}
      onClick={onClick}
      disabled={disabled || loading}
      style={glassEffects.button}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <AnimatedSpinner size="sm" />
            <span className="ml-2">Loading...</span>
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// 🌀 Beautiful Loading Spinner
interface AnimatedSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}

export const AnimatedSpinner: React.FC<AnimatedSpinnerProps> = ({
  size = "md",
  color = "currentColor",
  className = "",
}) => {
  const sizeMap = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <motion.div
      className={`${sizeMap[size]} ${className}`}
      variants={spinnerAnimations}
      animate="rotate"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="20"
          opacity="0.3"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="15"
          strokeDashoffset="15"
          className="origin-center"
        />
      </svg>
    </motion.div>
  );
};

// 📊 Cinematic Progress Bar
interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: string;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = "from-blue-500 to-purple-600",
  height = "h-2",
  className = "",
}) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <motion.span
              className="text-sm font-medium text-gray-700"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={ANIMATION_CONFIG.transition}
            >
              {label}
            </motion.span>
          )}
          {showPercentage && (
            <motion.span
              className="text-sm font-bold text-gray-900"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={ANIMATION_CONFIG.transition}
            >
              {percentage}%
            </motion.span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}
      >
        <motion.div
          className={`${height} bg-gradient-to-r ${color} rounded-full relative`}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          variants={progressAnimations}
          transition={{
            duration: ANIMATION_CONFIG.duration.dramatic,
            ease: ANIMATION_CONFIG.easing.smooth,
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: "50%" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// 🎭 Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 1.05 }}
      transition={ANIMATION_CONFIG.transition}
    >
      {children}
    </motion.div>
  );
};

// 🎪 Stagger Container for Lists
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
  delay = 0.1,
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// ✨ Floating Action Button
interface FloatingActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  onClick,
  position = "bottom-right",
  className = "",
}) => {
  const positionStyles = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <motion.button
      className={`fixed ${positionStyles[position]} w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50 ${className}`}
      style={glassEffects.button}
      variants={buttonAnimations}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      layout
    >
      {children}
    </motion.button>
  );
};
