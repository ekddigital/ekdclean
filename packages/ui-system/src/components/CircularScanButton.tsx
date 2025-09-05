// EKD Clean - Circular Scan Button Component
// Built by EKD Digital - Superior to CleanMyMac

import React, { useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export type ScanState =
  | "idle"
  | "indeterminate"
  | "scanning"
  | "paused"
  | "done"
  | "error";

interface CircularScanButtonProps {
  size?: number; // px
  strokeWidth?: number;
  progress: number; // 0..1
  state: ScanState;
  label?: string;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export function CircularScanButton({
  size = 120,
  strokeWidth = 8,
  progress,
  state,
  label = "Smart Scan",
  onClick,
  ariaLabel,
  disabled = false,
}: CircularScanButtonProps) {
  const half = size / 2;
  const radius = useMemo(() => half - strokeWidth / 2, [half, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // Use framer-motion values to smoothly animate dashoffset
  const motionProgress = useMotionValue(progress);
  React.useEffect(() => {
    const controls = animate(motionProgress, progress, {
      type: "spring",
      stiffness: 120,
      damping: 18,
    });
    return controls.stop;
  }, [progress, motionProgress]);

  const dashoffset = useTransform(motionProgress, (p) => {
    // progress 1 => offset 0 (full ring), progress 0 => offset circumference
    return circumference * (1 - Math.max(0, Math.min(1, p)));
  });

  // EKD Digital color scheme
  const ringColor =
    state === "error"
      ? "#EF4444"
      : state === "done"
        ? "#10B981"
        : "url(#ekdGradient)";

  // Provide accessible label text
  const computedAria = ariaLabel ?? `${label} — ${Math.round(progress * 100)}%`;

  // Status text below button
  const getStatusText = () => {
    switch (state) {
      case "scanning":
      case "indeterminate":
        return `Scanning — ${Math.round(progress * 100)}%`;
      case "done":
        return "Scan complete";
      case "idle":
        return "Ready to scan";
      case "error":
        return "Scan failed";
      case "paused":
        return "Paused";
      default:
        return "Ready to scan";
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Main Circular Button */}
      <motion.button
        type="button"
        role="button"
        aria-label={computedAria}
        aria-busy={state === "scanning" || state === "indeterminate"}
        disabled={disabled}
        onClick={onClick}
        className="relative focus:outline-none transition-all duration-200"
        style={{ width: size, height: size }}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{
            background:
              state === "scanning" || state === "indeterminate"
                ? "linear-gradient(135deg, #F59E0B, #F97316)"
                : "transparent",
          }}
        />

        {/* SVG Progress Ring */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          aria-hidden
        >
          <defs>
            {/* EKD Digital brand gradient */}
            <linearGradient id="ekdGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Subtle background gradient */}
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.90" />
            </linearGradient>
          </defs>

          {/* Background ring (subtle) */}
          <circle
            cx={half}
            cy={half}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress ring (animated via stroke-dashoffset) */}
          <motion.circle
            cx={half}
            cy={half}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${half} ${half})`} // start at 12 o'clock
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashoffset }}
            className="drop-shadow-sm"
          />

          {/* Indeterminate sweeping arc when progress is unknown */}
          {state === "indeterminate" && (
            <g transform={`rotate(-90 ${half} ${half})`}>
              <motion.path
                d={describeArcPath(half, half, radius, 0, 90)}
                stroke="url(#ekdGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                style={{ rotate: 0, originX: half, originY: half }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
              />
            </g>
          )}
        </svg>

        {/* Center button content */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateZ(0)" }}
        >
          <div
            className="flex flex-col items-center justify-center select-none"
            style={{
              width: size - strokeWidth * 3,
              height: size - strokeWidth * 3,
              borderRadius: "9999px",
              background:
                state === "done"
                  ? "rgba(16, 185, 129, 0.08)"
                  : "url(#bgGradient)",
              boxShadow:
                "0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
            }}
          >
            {/* Icon */}
            <div className="flex items-center justify-center mb-1">
              {state === "done" ? (
                <motion.svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  aria-hidden
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <path
                    d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.192 9.2-4.1-4.116a1 1 0 0 0-1.414 1.413l4.9 4.915a1 1 0 0 0 1.414 0z"
                    fill="#10B981"
                  />
                </motion.svg>
              ) : state === "error" ? (
                <motion.svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  aria-hidden
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <path
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  aria-hidden
                  animate={
                    state === "scanning" || state === "indeterminate"
                      ? { rotate: 360 }
                      : {}
                  }
                  transition={
                    state === "scanning" || state === "indeterminate"
                      ? { repeat: Infinity, ease: "linear", duration: 2 }
                      : {}
                  }
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </motion.svg>
              )}
            </div>

            {/* Label */}
            <span className="text-sm font-semibold text-slate-700 text-center leading-tight">
              {state === "scanning"
                ? "Scanning"
                : state === "paused"
                  ? "Paused"
                  : state === "done"
                    ? "Complete"
                    : state === "error"
                      ? "Error"
                      : label}
            </span>
          </div>
        </div>
      </motion.button>

      {/* Status line */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm text-slate-600 font-medium">
          {getStatusText()}
        </div>
        {(state === "scanning" || state === "done") && (
          <div className="text-xs text-slate-500 mt-1">
            {state === "done"
              ? "Ready to review results"
              : "Analyzing your system..."}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * Utility to create an SVG arc path (used for indeterminate sweep)
 * Returns a path string for an arc from startAngle to endAngle (degrees)
 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default CircularScanButton;
