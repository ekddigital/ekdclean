// EKD Clean - Sidebar Navigation Component
// Built by EKD Digital - Superior to CleanMyMac

import React from "react";
import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Divider,
} from "@mantine/core";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  description: string;
}

interface SidebarProps {
  activeItem: string;
  onItemSelect: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemSelect,
}) => {
  const sidebarItems: SidebarItem[] = [
    {
      id: "smart-scan",
      label: "Smart Scan",
      icon: "🔍",
      description: "Comprehensive system analysis",
    },
    {
      id: "system-junk",
      label: "System Junk",
      icon: "🗑️",
      badge: 12,
      description: "Cache files, logs, and temporary data",
    },
    {
      id: "photo-junk",
      label: "Photo Junk",
      icon: "📸",
      badge: 5,
      description: "Duplicate photos and screenshots",
    },
    {
      id: "mail-attachments",
      label: "Mail Attachments",
      icon: "📧",
      badge: 8,
      description: "Large email attachments",
    },
    {
      id: "trash-bins",
      label: "Trash Bins",
      icon: "🗂️",
      badge: 3,
      description: "Items in various trash locations",
    },
    {
      id: "large-old-files",
      label: "Large & Old Files",
      icon: "📦",
      description: "Files taking up unnecessary space",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: "🛡️",
      description: "Browser data and sensitive information",
    },
    {
      id: "speed",
      label: "Speed",
      icon: "⚡",
      description: "Performance optimization tools",
    },
  ];

  const glassStyles = {
    background: "rgba(15, 15, 15, 0.4)", // Dark background with transparency
    backdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(245, 158, 11, 0.2)", // EKD Gold border
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  };

  return (
    <motion.div
      className="h-full w-80 flex flex-col"
      style={{
        ...glassStyles,
        borderRadius: "0 24px 24px 0",
      }}
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.6,
      }}
    >
      {/* Header */}
      <div className="p-8 border-b border-gold-500/20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Group align="center" gap="lg">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500 via-gold-600 to-amber-700 flex items-center justify-center shadow-2xl shadow-gold-500/30">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="text-white text-2xl"
              >
                ⚡
              </motion.div>
            </div>
            <div>
              <Text size="xl" fw={700} c="white" className="text-shadow">
                EKD Clean
              </Text>
              <Text size="sm" c="rgba(245, 158, 11, 0.9)" fw={600}>
                System Optimizer
              </Text>
            </div>
          </Group>
        </motion.div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <Stack gap="md">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.1 * index,
                duration: 0.4,
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
            >
              <Tooltip
                label={item.description}
                position="right"
                withArrow
                offset={20}
              >
                <motion.div
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                    activeItem === item.id
                      ? "bg-gradient-to-r from-gold-500/20 via-amber-600/20 to-yellow-500/20 border border-gold-400/40 shadow-xl shadow-gold-500/15"
                      : "hover:bg-gold-500/10 hover:border-gold-400/20 border border-transparent"
                  }`}
                  onClick={() => onItemSelect(item.id)}
                  whileHover={{
                    scale: 1.02,
                    x: 6,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  style={{
                    backdropFilter:
                      activeItem === item.id ? "blur(15px)" : "none",
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group align="center" gap="lg">
                      <motion.div
                        className="text-2xl"
                        animate={
                          activeItem === item.id
                            ? { scale: [1, 1.15, 1] }
                            : { scale: 1 }
                        }
                        transition={{
                          duration: 0.6,
                          repeat: activeItem === item.id ? Infinity : 0,
                          repeatDelay: 2.5,
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <Text
                          size="md"
                          fw={activeItem === item.id ? 700 : 600}
                          c={
                            activeItem === item.id
                              ? "white"
                              : "rgba(255, 255, 255, 0.9)"
                          }
                          className={
                            activeItem === item.id ? "text-shadow" : ""
                          }
                        >
                          {item.label}
                        </Text>
                      </div>
                    </Group>

                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2 * index,
                          type: "spring",
                          damping: 15,
                          stiffness: 300,
                        }}
                      >
                        <Badge
                          size="sm"
                          variant="filled"
                          color="red"
                          style={{
                            background:
                              "linear-gradient(45deg, #ef4444, #f87171)",
                            border: "none",
                            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                          }}
                        >
                          {item.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </Group>

                  {/* Active indicator */}
                  {activeItem === item.id && (
                    <motion.div
                      className="absolute left-0 top-1/2 w-1.5 h-10 bg-gradient-to-b from-gold-400 via-gold-500 to-amber-600 rounded-r-full shadow-xl shadow-gold-400/60"
                      style={{ transform: "translateY(-50%)" }}
                      layoutId="activeIndicator"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                    />
                  )}
                </motion.div>
              </Tooltip>
            </motion.div>
          ))}
        </Stack>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gold-500/20">
        <Divider color="rgba(245, 158, 11, 0.2)" mb="lg" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs" c="rgba(245, 158, 11, 0.8)" fw={600}>
              v1.0.0 • EKD Digital
            </Text>
            <ActionIcon
              variant="subtle"
              size="md"
              className="hover:bg-gold-500/20 transition-colors"
              style={{ color: "rgba(245, 158, 11, 0.8)" }}
            >
              ⚙️
            </ActionIcon>
          </Group>
        </motion.div>
      </div>
    </motion.div>
  );
};
