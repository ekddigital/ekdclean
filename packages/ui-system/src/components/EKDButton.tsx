// EKD Clean - EKD Button Component
// Built by EKD Digital

import React from "react";
import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
} from "@mantine/core";
import { motion } from "framer-motion";

interface EKDButtonProps extends Omit<MantineButtonProps, "component"> {
  /**
   * Enable cinematic animations
   */
  animated?: boolean;
  /**
   * Custom animation variant
   */
  animationVariant?: "scale" | "slide" | "glow" | "bounce";
}

const animationVariants = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  slide: {
    whileHover: { x: 2, y: -2 },
    whileTap: { x: 0, y: 0 },
    transition: { duration: 0.15, ease: "easeOut" },
  },
  glow: {
    whileHover: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.3 },
    },
    whileTap: { scale: 0.98 },
  },
  bounce: {
    whileHover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    whileTap: { scale: 0.9 },
  },
};

export const EKDButton: React.FC<EKDButtonProps> = ({
  animated = true,
  animationVariant = "scale",
  children,
  ...props
}) => {
  if (!animated) {
    return <MantineButton {...props}>{children}</MantineButton>;
  }

  return (
    <motion.div
      {...animationVariants[animationVariant]}
      style={{ display: "inline-block" }}
    >
      <MantineButton {...props}>{children}</MantineButton>
    </motion.div>
  );
};

export default EKDButton;
