// EKD Clean - Status Bar Component
// Built by EKD Digital

import React from "react";
import { Group, Text, Badge, Box } from "@mantine/core";
import { SystemInfo } from "../../../shared/types";

interface StatusBarProps {
  systemInfo: SystemInfo | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ systemInfo }) => {
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

  return (
    <Box
      h="100%"
      style={{
        background: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        {/* Left side - System info */}
        <Group gap="md">
          {systemInfo && (
            <>
              <Badge
                variant="light"
                color="gray"
                size="sm"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {systemInfo.platform.toUpperCase()} {systemInfo.arch}
              </Badge>

              <Text size="xs" c="rgba(255, 255, 255, 0.8)">
                Memory:{" "}
                {formatBytes(systemInfo.totalMemory - systemInfo.freeMemory)} /{" "}
                {formatBytes(systemInfo.totalMemory)}(
                {getMemoryUsagePercentage().toFixed(1)}%)
              </Text>

              <Text size="xs" c="rgba(255, 255, 255, 0.8)">
                CPU Cores: {systemInfo.cpuCount}
              </Text>
            </>
          )}
        </Group>

        {/* Right side - App info */}
        <Group gap="md">
          <Text size="xs" c="rgba(255, 255, 255, 0.6)">
            Built by EKD Digital
          </Text>

          {systemInfo && (
            <Badge
              variant="light"
              color="blue"
              size="sm"
              style={{
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                color: "#90caf9",
                border: "1px solid rgba(33, 150, 243, 0.3)",
              }}
            >
              v{systemInfo.appVersion}
            </Badge>
          )}
        </Group>
      </Group>
    </Box>
  );
};
