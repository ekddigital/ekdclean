// EKD Clean - Advanced Animation System
// Built by EKD Digital - Making CleanMyMac look ordinary

import { Variants, Transition } from "framer-motion";

// ✨ 120fps Animation Configurations
export const ANIMATION_CONFIG = {
  // Ultra-smooth 120fps targeting
  transition: {
    type: "spring",
    damping: 25,
    stiffness: 300,
    mass: 0.8,
    velocity: 0,
  } as Transition,

  // High performance easing curves
  easing: {
    smooth: [0.25, 0.46, 0.45, 0.94],
    dramatic: [0.68, -0.55, 0.265, 1.55],
    gentle: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.6, 0.32, 1.6],
  },

  // Duration settings for different UI elements
  duration: {
    instant: 0.1,
    quick: 0.2,
    normal: 0.3,
    slow: 0.5,
    dramatic: 0.8,
  },
};

// 🌟 Glass Morphism Effects
export const glassEffects = {
  card: {
    backdropFilter: "blur(20px) saturate(180%)",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },

  button: {
    backdropFilter: "blur(15px) saturate(160%)",
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
  },

  panel: {
    backdropFilter: "blur(25px) saturate(200%)",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
  },
};

// 🎭 Cinematic Page Transitions
export const pageTransitions: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    rotateX: -5,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      ...ANIMATION_CONFIG.transition,
      duration: ANIMATION_CONFIG.duration.normal,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    y: -20,
    rotateX: 5,
    transition: {
      ...ANIMATION_CONFIG.transition,
      duration: ANIMATION_CONFIG.duration.quick,
    },
  },
};

// 🌊 Fluid Card Animations
export const cardAnimations: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
    rotateY: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      ...ANIMATION_CONFIG.transition,
      duration: ANIMATION_CONFIG.duration.normal,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    rotateY: 2,
    transition: {
      ...ANIMATION_CONFIG.transition,
      duration: ANIMATION_CONFIG.duration.quick,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.instant,
    },
  },
};

// ⚡ Lightning-Fast Button Animations
export const buttonAnimations: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
    transition: {
      duration: ANIMATION_CONFIG.duration.quick,
      ease: ANIMATION_CONFIG.easing.gentle,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: ANIMATION_CONFIG.duration.instant,
    },
  },
  loading: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// 🎯 Progress Bar Animations
export const progressAnimations: Variants = {
  hidden: {
    width: "0%",
    opacity: 0,
  },
  visible: {
    width: "100%",
    opacity: 1,
    transition: {
      width: {
        duration: ANIMATION_CONFIG.duration.dramatic,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
      opacity: {
        duration: ANIMATION_CONFIG.duration.quick,
      },
    },
  },
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// 🌀 Loading Spinner Animations
export const spinnerAnimations = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },

  scale: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  pulse: {
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// 🎨 Color Transition Helpers
export const colorTransitions = {
  success: {
    backgroundColor: ["#10B981", "#059669", "#10B981"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  warning: {
    backgroundColor: ["#F59E0B", "#D97706", "#F59E0B"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  error: {
    backgroundColor: ["#EF4444", "#DC2626", "#EF4444"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// 🎪 Stagger Animation Helpers
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...ANIMATION_CONFIG.transition,
      duration: ANIMATION_CONFIG.duration.normal,
    },
  },
};

// 🎬 Cinematic Scan Animation
export const scanAnimations: Variants = {
  idle: {
    backgroundPosition: "0% 50%",
  },
  scanning: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
  complete: {
    backgroundPosition: "100% 50%",
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.smooth,
    },
  },
};

// 🔥 Advanced Particle System (for celebration effects)
export const particleAnimations = {
  burst: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.5,
      ease: ANIMATION_CONFIG.easing.bounce,
    },
  },

  float: {
    y: [-10, 10, -10],
    x: [-5, 5, -5],
    rotate: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// 🎵 Sound Integration Points (for future sound implementation)
export const soundCues = {
  scan: "scan_progress.mp3",
  complete: "scan_complete.mp3",
  button: "button_click.mp3",
  success: "success_chime.mp3",
  error: "error_sound.mp3",
  notification: "notification.mp3",
};
