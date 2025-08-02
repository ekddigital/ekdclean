// EKD Clean - Enhanced Dashboard Component
// Built by EKD Digital - Beyond CleanMyMac

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  Text,
  Button,
  Progress,
  Group,
  Stack,
  RingProgress,
  Box,
  Title,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import { SystemInfo } from "../types";

interface DashboardProps {
  systemInfo: SystemInfo | null;
  isScanning: boolean;
  onScanStart: () => void;
  onScanComplete: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  systemInfo,
  isScanning,
  onScanStart,
  onScanComplete,
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [junkFound, setJunkFound] = useState(0);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMemoryUsagePercentage = (): number => {
    if (!systemInfo) return 0;
    return (
      ((systemInfo.totalMemory - systemInfo.freeMemory) /
        systemInfo.totalMemory) *
      100
    );
  };

  const handleScan = async () => {
    onScanStart();
    setScanProgress(0);
    setJunkFound(0);

    // Simulate scanning process with beautiful animations
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          onScanComplete();
          setJunkFound(Math.floor(Math.random() * 500) + 100);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  return (
    <Stack gap="xl" h="100%">
      {/* Header with cinematic animations */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box ta="center" py="lg">
          <Title
            order={1}
            c="white"
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            EKD Clean
          </Title>
          <Text
            size="lg"
            c="rgba(255, 255, 255, 0.8)"
            style={{
              letterSpacing: "1px",
              fontWeight: 300,
            }}
          >
            Advanced System Optimization Suite
          </Text>
        </Box>
      </motion.div>

      {/* System Overview Cards with glass morphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {/* Memory Usage Card */}
          <Card
            padding="lg"
            radius="xl"
            className="glass"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack align="center" gap="sm">
              <RingProgress
                size={80}
                thickness={6}
                sections={[
                  {
                    value: getMemoryUsagePercentage(),
                    color:
                      getMemoryUsagePercentage() > 80
                        ? "red"
                        : getMemoryUsagePercentage() > 60
                          ? "yellow"
                          : "blue",
                  },
                ]}
                label={
                  <Text ta="center" size="xs" c="white" fw={700}>
                    {getMemoryUsagePercentage().toFixed(0)}%
                  </Text>
                }
              />
              <Text size="sm" c="white" fw={500} ta="center">
                Memory Usage
              </Text>
              {systemInfo && (
                <Text size="xs" c="rgba(255, 255, 255, 0.7)" ta="center">
                  {formatBytes(systemInfo.totalMemory - systemInfo.freeMemory)}{" "}
                  / {formatBytes(systemInfo.totalMemory)}
                </Text>
              )}
            </Stack>
          </Card>

          {/* Main Action Card */}
          <Card
            padding="xl"
            radius="xl"
            className="glass"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <div>
                  <Title order={3} c="white">
                    System Optimization
                  </Title>
                  <Text c="rgba(255, 255, 255, 0.7)" size="sm">
                    Scan for junk files and optimization opportunities
                  </Text>
                </div>

                <Button
                  size="lg"
                  radius="xl"
                  onClick={handleScan}
                  loading={isScanning}
                  style={{
                    background: "linear-gradient(45deg, #2196F3, #21CBF3)",
                    border: "none",
                    minWidth: "140px",
                  }}
                >
                  {isScanning ? "Scanning..." : "Start Scan"}
                </Button>
              </Group>

              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <Divider color="rgba(255, 255, 255, 0.2)" my="md" />
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" c="white">
                        Scanning system files...
                      </Text>
                      <Text size="sm" c="white" fw={500}>
                        {scanProgress.toFixed(0)}%
                      </Text>
                    </Group>
                    <Progress
                      value={scanProgress}
                      size="md"
                      radius="xl"
                      color="blue"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    />
                  </Stack>
                </motion.div>
              )}

              {junkFound > 0 && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <Divider color="rgba(255, 255, 255, 0.2)" my="md" />
                  <Group justify="space-between" align="center">
                    <div>
                      <Text c="white" fw={500}>
                        Found {junkFound} junk files
                      </Text>
                      <Text size="sm" c="rgba(255, 255, 255, 0.7)">
                        Estimated space to recover:{" "}
                        {formatBytes(junkFound * 1024 * Math.random() * 100)}
                      </Text>
                    </div>
                    <Button variant="light" color="orange" radius="xl">
                      Clean Now
                    </Button>
                  </Group>
                </motion.div>
              )}
            </Stack>
          </Card>
        </SimpleGrid>
      </motion.div>
    </Stack>
  );
};
