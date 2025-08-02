// EKD Clean - Main Dashboard Layout
// Built by EKD Digital - Superior to CleanMyMac

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Text,
  Button,
  Progress,
  Group,
  Stack,
  RingProgress,
  Title,
  SimpleGrid,
  ScrollArea,
  Container,
} from "@mantine/core";
import { SystemInfo } from "../types";
import { Sidebar } from "./Sidebar";
import { SoundManager } from "../utils/SoundManager";

interface MainDashboardProps {
  systemInfo: SystemInfo | null;
  isScanning: boolean;
  onStartScan: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  systemInfo,
  isScanning,
  onStartScan,
}) => {
  const [activeItem, setActiveItem] = useState("smart-scan");
  const [scanProgress, setScanProgress] = useState(45);
  const [junkFound, setJunkFound] = useState(12);
  const soundManager = SoundManager.getInstance();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMemoryUsagePercentage = (): number => {
    if (!systemInfo) return 0;
    return Math.round(
      ((systemInfo.totalMemory - systemInfo.freeMemory) /
        systemInfo.totalMemory) *
        100
    );
  };

  const handleScanClick = async () => {
    await soundManager.resumeContext();
    soundManager.playClick();
    soundManager.playScan();

    // Reset scan state
    setScanProgress(0);
    setJunkFound(0);

    onStartScan();

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setJunkFound(Math.floor(Math.random() * 50) + 12);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const glassCardStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  };

  const renderContent = () => {
    switch (activeItem) {
      case "smart-scan":
        return (
          <motion.div
            key="smart-scan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Hero Section */}
            <Card padding="xl" radius="xl" style={glassCardStyle}>
              <Stack gap="lg" align="center">
                <motion.div
                  animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 2,
                    repeat: isScanning ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-3xl">🔍</span>
                </motion.div>

                <div className="text-center">
                  <Title order={2} c="white" mb="sm">
                    Smart Scan
                  </Title>
                  <Text c="rgba(255, 255, 255, 0.8)" size="lg">
                    Comprehensive system analysis and optimization
                  </Text>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="xl"
                    radius="xl"
                    onClick={handleScanClick}
                    loading={isScanning}
                    style={{
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      border: "none",
                      minWidth: "200px",
                      padding: "16px 32px",
                      fontSize: "18px",
                    }}
                  >
                    {isScanning ? "Scanning System..." : "Start Smart Scan"}
                  </Button>
                </motion.div>
              </Stack>
            </Card>

            {/* System Overview Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {/* Memory Usage */}
              <Card padding="lg" radius="xl" style={glassCardStyle}>
                <Stack align="center" gap="md">
                  <RingProgress
                    size={120}
                    thickness={8}
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
                      <Text ta="center" size="lg" c="white" fw={700}>
                        {getMemoryUsagePercentage()}%
                      </Text>
                    }
                  />
                  <div className="text-center">
                    <Text size="lg" fw={600} c="white">
                      Memory Usage
                    </Text>
                    {systemInfo && (
                      <Text size="sm" c="rgba(255, 255, 255, 0.7)">
                        {formatBytes(
                          systemInfo.totalMemory - systemInfo.freeMemory
                        )}{" "}
                        / {formatBytes(systemInfo.totalMemory)}
                      </Text>
                    )}
                  </div>
                </Stack>
              </Card>

              {/* System Info */}
              <Card padding="lg" radius="xl" style={glassCardStyle}>
                <Stack gap="md">
                  <Text size="lg" fw={600} c="white" ta="center">
                    System Info
                  </Text>
                  {systemInfo && (
                    <Stack gap="sm">
                      <Group justify="apart">
                        <Text size="sm" c="rgba(255, 255, 255, 0.8)">
                          Platform
                        </Text>
                        <Text size="sm" fw={500} c="white">
                          {systemInfo.platform}
                        </Text>
                      </Group>
                      <Group justify="apart">
                        <Text size="sm" c="rgba(255, 255, 255, 0.8)">
                          CPU Cores
                        </Text>
                        <Text size="sm" fw={500} c="white">
                          {systemInfo.cpuCount}
                        </Text>
                      </Group>
                      <Group justify="apart">
                        <Text size="sm" c="rgba(255, 255, 255, 0.8)">
                          Architecture
                        </Text>
                        <Text size="sm" fw={500} c="white">
                          {systemInfo.arch}
                        </Text>
                      </Group>
                      <Group justify="apart">
                        <Text size="sm" c="rgba(255, 255, 255, 0.8)">
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

              {/* Scan Results */}
              <Card padding="lg" radius="xl" style={glassCardStyle}>
                <Stack gap="md" align="center">
                  <Text size="lg" fw={600} c="white">
                    Scan Results
                  </Text>

                  {isScanning ? (
                    <motion.div className="w-full">
                      <Stack gap="md">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                        />
                        <Progress
                          value={scanProgress}
                          size="lg"
                          radius="xl"
                          color="blue"
                          striped
                          animated
                        />
                        <Text
                          size="sm"
                          c="rgba(255, 255, 255, 0.8)"
                          ta="center"
                        >
                          Analyzing system files...
                        </Text>
                      </Stack>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 300,
                      }}
                    >
                      <Stack align="center" gap="sm">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Text size="4xl" fw={700} c="white">
                            {junkFound}
                          </Text>
                        </motion.div>
                        <Text size="sm" c="rgba(255, 255, 255, 0.8)">
                          Issues Found
                        </Text>
                        <Button
                          variant="light"
                          color="orange"
                          radius="xl"
                          size="sm"
                        >
                          Clean Now
                        </Button>
                      </Stack>
                    </motion.div>
                  )}
                </Stack>
              </Card>
            </SimpleGrid>

            {/* Additional Content Sections */}
            <Card padding="xl" radius="xl" style={glassCardStyle}>
              <Stack gap="lg">
                <Title order={3} c="white">
                  Recent Activity
                </Title>
                <Stack gap="md">
                  <Group justify="apart" align="center">
                    <Group align="center" gap="md">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white">✓</span>
                      </div>
                      <div>
                        <Text c="white" fw={500}>
                          System Cache Cleaned
                        </Text>
                        <Text size="sm" c="rgba(255, 255, 255, 0.7)">
                          2.4 GB recovered
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" c="rgba(255, 255, 255, 0.6)">
                      2 minutes ago
                    </Text>
                  </Group>

                  <Group justify="apart" align="center">
                    <Group align="center" gap="md">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white">🔍</span>
                      </div>
                      <div>
                        <Text c="white" fw={500}>
                          Smart Scan Completed
                        </Text>
                        <Text size="sm" c="rgba(255, 255, 255, 0.7)">
                          12 issues identified
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" c="rgba(255, 255, 255, 0.6)">
                      5 minutes ago
                    </Text>
                  </Group>

                  <Group justify="apart" align="center">
                    <Group align="center" gap="md">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white">⚡</span>
                      </div>
                      <div>
                        <Text c="white" fw={500}>
                          System Optimized
                        </Text>
                        <Text size="sm" c="rgba(255, 255, 255, 0.7)">
                          Performance improved by 15%
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" c="rgba(255, 255, 255, 0.6)">
                      10 minutes ago
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </motion.div>
        );

      default:
        return (
          <motion.div
            key={activeItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card padding="xl" radius="xl" style={glassCardStyle}>
              <Stack align="center" gap="lg">
                <div className="text-6xl">🚧</div>
                <Title order={2} c="white" ta="center">
                  {activeItem
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Title>
                <Text c="rgba(255, 255, 255, 0.8)" ta="center" size="lg">
                  This feature is coming soon! Stay tuned for advanced
                  optimization tools.
                </Text>
                <Button variant="light" color="blue" radius="xl">
                  Learn More
                </Button>
              </Stack>
            </Card>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar activeItem={activeItem} onItemSelect={setActiveItem} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <ScrollArea className="flex-1" type="scroll">
          <Container size="xl" className="p-6 min-h-full">
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </Container>
        </ScrollArea>
      </div>
    </div>
  );
};
