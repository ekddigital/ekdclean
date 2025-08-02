// EKD Clean - Enhanced Dashboard Component
// Built by EKD Digital - Beyond CleanMyMac

import React from "react";
import { motion } from "framer-motion";
import { Card, Text, Button, Progress, Group, Stack } from "@mantine/core";
import { SystemInfo } from "../types";
import { SoundManager } from "../utils/SoundManager";

interface DashboardProps {
  systemInfo: SystemInfo | null;
  isScanning: boolean;
  onStartScan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  systemInfo,
  isScanning,
  onStartScan,
}) => {
  const scanProgress = 45; // Mock progress for now
  const foundIssues = 12; // Mock issues found
  const soundManager = SoundManager.getInstance();

  // Enhanced glass morphism styles
  const glassStyles = {
    backdropFilter: "blur(20px) saturate(180%)",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMemoryUsage = (): number => {
    if (!systemInfo) return 0;
    return Math.round(
      ((systemInfo.totalMemory - systemInfo.freeMemory) /
        systemInfo.totalMemory) *
        100
    );
  };

  // Beautiful animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.6,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 400,
        duration: 0.3,
      },
    },
  };

  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 200,
            delay: 0.5,
          }}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <motion.div
              animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 2,
                repeat: isScanning ? Infinity : 0,
                ease: "linear",
              }}
              className="text-white text-3xl"
            >
              ⚡
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          EKD Clean
        </motion.h1>

        <motion.p
          className="text-xl text-white/80 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Your Mac deserves the best optimization
        </motion.p>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            size="xl"
            radius="xl"
            onClick={() => {
              soundManager.resumeContext();
              soundManager.playClick();
              soundManager.playScan();
              onStartScan();
            }}
            disabled={isScanning}
            loading={isScanning}
            className="px-12 py-4 text-lg font-semibold"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(15px) saturate(160%)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            }}
          >
            {isScanning ? "Scanning..." : "Start Deep Scan"}
          </Button>
        </motion.div>
      </motion.div>

      {/* System Overview Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {/* Memory Usage Card */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="h-full" style={glassStyles} p="lg" radius="xl">
            <Stack gap="md">
              <Group justify="apart">
                <Text size="lg" fw={600} c="white">
                  Memory Usage
                </Text>
                <motion.div
                  animate={
                    getMemoryUsage() > 80
                      ? { scale: [1, 1.1, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 2,
                    repeat: getMemoryUsage() > 80 ? Infinity : 0,
                  }}
                >
                  <Text size="xl" fw={700} c="white">
                    {getMemoryUsage()}%
                  </Text>
                </motion.div>
              </Group>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getMemoryUsage()}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <Progress
                  value={getMemoryUsage()}
                  size="lg"
                  radius="xl"
                  color={getMemoryUsage() > 80 ? "red" : "blue"}
                  striped
                  animated
                />
              </motion.div>

              {systemInfo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Text size="sm" c="white" opacity={0.8}>
                    {formatBytes(
                      systemInfo.totalMemory - systemInfo.freeMemory
                    )}{" "}
                    / {formatBytes(systemInfo.totalMemory)}
                  </Text>
                </motion.div>
              )}
            </Stack>
          </Card>
        </motion.div>

        {/* System Info Card */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="h-full" style={glassStyles} p="lg" radius="xl">
            <Stack gap="md">
              <Text size="lg" fw={600} c="white">
                System Overview
              </Text>

              {systemInfo && (
                <Stack gap="xs">
                  <Group justify="apart">
                    <Text size="sm" c="white" opacity={0.8}>
                      Platform
                    </Text>
                    <Text size="sm" fw={500} c="white">
                      {systemInfo.platform}
                    </Text>
                  </Group>

                  <Group justify="apart">
                    <Text size="sm" c="white" opacity={0.8}>
                      CPU Cores
                    </Text>
                    <Text size="sm" fw={500} c="white">
                      {systemInfo.cpuCount}
                    </Text>
                  </Group>

                  <Group justify="apart">
                    <Text size="sm" c="white" opacity={0.8}>
                      Node Version
                    </Text>
                    <Text size="sm" fw={500} c="white">
                      {systemInfo.nodeVersion}
                    </Text>
                  </Group>

                  <Group justify="apart">
                    <Text size="sm" c="white" opacity={0.8}>
                      App Version
                    </Text>
                    <Text size="sm" fw={500} c="white">
                      {systemInfo.appVersion}
                    </Text>
                  </Group>
                </Stack>
              )}
            </Stack>
          </Card>
        </motion.div>

        {/* Scan Results Card */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="h-full" style={glassStyles} p="lg" radius="xl">
            <Stack gap="md">
              <Text size="lg" fw={600} c="white">
                Scan Results
              </Text>

              {isScanning ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <Progress
                    value={scanProgress}
                    size="lg"
                    radius="xl"
                    color="green"
                    striped
                    animated
                  />
                  <Text size="sm" c="white" opacity={0.8} ta="center">
                    Scanning for optimization opportunities...
                  </Text>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Text size="3xl" c="white" fw={700}>
                      {foundIssues}
                    </Text>
                  </motion.div>
                  <Text size="sm" c="white" opacity={0.8}>
                    Issues found
                  </Text>
                </motion.div>
              )}
            </Stack>
          </Card>
        </motion.div>
      </motion.div>

      {/* Scan Progress Overlay */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <Text size="xl" fw={600} c="white" mb="md">
                Deep Scanning in Progress
              </Text>
              <Progress
                value={scanProgress}
                size="lg"
                radius="xl"
                color="blue"
                animated
                striped
              />
              <Text size="sm" c="white" opacity={0.8} mt="md">
                Analyzing system for optimization opportunities...
              </Text>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export { Dashboard as EnhancedDashboard };
