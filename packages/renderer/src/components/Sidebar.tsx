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
import { Sun, Moon } from "lucide-react";

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
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemSelect,
  isDarkMode = false,
  onThemeToggle,
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
    <div
      className={`h-full backdrop-blur-xl border-r w-72 flex flex-col ${
        isDarkMode
          ? "bg-gray-900/90 border-gray-700/50"
          : "bg-white/90 border-gray-200/50"
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 border-b ${
          isDarkMode ? "border-gray-700/30" : "border-gray-200/30"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <Text
              size="lg"
              fw={700}
              className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
            >
              EKD Clean
            </Text>
          </div>

          {/* Theme Toggle */}
          {onThemeToggle && (
            <Tooltip
              label={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              <ActionIcon
                onClick={onThemeToggle}
                variant="subtle"
                size="md"
                className={`transition-all ${
                  isDarkMode
                    ? "hover:bg-amber-500/20 text-amber-400"
                    : "hover:bg-amber-100/50 text-amber-600"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </ActionIcon>
            </Tooltip>
          )}
        </div>
        <Text size="xs" c={isDarkMode ? "gray.4" : "dimmed"} fw={500}>
          Professional System Optimizer
        </Text>
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
                      ? isDarkMode
                        ? "bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-yellow-900/40 border border-amber-400/40 shadow-xl shadow-amber-500/20"
                        : "bg-gradient-to-r from-amber-100/80 via-orange-100/80 to-yellow-100/80 border border-amber-300/50 shadow-xl shadow-amber-200/30"
                      : isDarkMode
                        ? "hover:bg-amber-900/20 hover:border-amber-400/20 border border-transparent"
                        : "hover:bg-amber-50/50 hover:border-amber-200/30 border border-transparent"
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
                            isDarkMode
                              ? activeItem === item.id
                                ? "white"
                                : "gray.3"
                              : activeItem === item.id
                                ? "dark.9"
                                : "dark.6"
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
                          color="orange"
                          style={{
                            background:
                              "linear-gradient(45deg, #f97316, #fb923c)",
                            border: "none",
                            boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)",
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
                      className="absolute left-0 top-1/2 w-1.5 h-10 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 rounded-r-full shadow-xl shadow-amber-400/60"
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
      <div
        className={`p-6 border-t ${
          isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
        }`}
      >
        <Divider
          color={
            isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(156, 163, 175, 0.3)"
          }
          mb="lg"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs" c={isDarkMode ? "gray.4" : "dark.4"} fw={600}>
              v1.0.0 • EKD Digital
            </Text>
            <ActionIcon
              variant="subtle"
              size="md"
              className={`transition-colors ${
                isDarkMode ? "hover:bg-amber-500/20" : "hover:bg-amber-100/50"
              }`}
              style={{
                color: isDarkMode
                  ? "rgba(245, 158, 11, 0.8)"
                  : "rgba(120, 113, 108, 0.8)",
              }}
            >
              ⚙️
            </ActionIcon>
          </Group>
        </motion.div>
      </div>
    </div>
  );
};
