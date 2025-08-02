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
    background: "rgba(15, 23, 42, 0.3)", // Dark slate with transparency
    backdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(59, 130, 246, 0.2)", // EKD Blue border
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
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
      <div className="p-6 border-b border-blue-500/20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Group align="center" gap="md">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="text-white text-xl"
              >
                ⚡
              </motion.div>
            </div>
            <div>
              <Text size="xl" fw={700} c="white" className="text-shadow">
                EKD Clean
              </Text>
              <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                System Optimizer
              </Text>
            </div>
          </Group>
        </motion.div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <Stack gap="xs">
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
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    activeItem === item.id
                      ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 border border-blue-400/40 shadow-lg shadow-blue-500/10"
                      : "hover:bg-blue-500/10 hover:border-blue-400/20 border border-transparent"
                  }`}
                  onClick={() => onItemSelect(item.id)}
                  whileHover={{
                    scale: 1.02,
                    x: 4,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  style={{
                    backdropFilter:
                      activeItem === item.id ? "blur(10px)" : "none",
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group align="center" gap="md">
                      <motion.div
                        className="text-2xl"
                        animate={
                          activeItem === item.id
                            ? { scale: [1, 1.1, 1] }
                            : { scale: 1 }
                        }
                        transition={{
                          duration: 0.5,
                          repeat: activeItem === item.id ? Infinity : 0,
                          repeatDelay: 2,
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <Text
                          size="sm"
                          fw={activeItem === item.id ? 600 : 500}
                          c={
                            activeItem === item.id
                              ? "white"
                              : "rgba(255, 255, 255, 0.9)"
                          }
                          className={activeItem === item.id ? "text-shadow" : ""}
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
                      className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 via-purple-500 to-indigo-500 rounded-r-full shadow-lg shadow-blue-400/50"
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
      <div className="p-4 border-t border-blue-500/20">
        <Divider color="rgba(59, 130, 246, 0.2)" mb="md" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs" c="rgba(59, 130, 246, 0.8)" fw={500}>
              v1.0.0 • EKD Digital
            </Text>
            <ActionIcon
              variant="subtle"
              size="sm"
              className="hover:bg-blue-500/20 transition-colors"
              style={{ color: "rgba(59, 130, 246, 0.8)" }}
            >
              ⚙️
            </ActionIcon>
          </Group>
        </motion.div>
      </div>
    </motion.div>
  );
};
