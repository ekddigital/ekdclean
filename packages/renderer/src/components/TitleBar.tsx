// EKD Clean - Title Bar Component
// Built by EKD Digital

import React from "react";
import { motion } from "framer-motion";
import { Group, Text, ActionIcon, Box, Tooltip } from "@mantine/core";

interface TitleBarProps {
  onWindowAction: (action: "minimize" | "maximize" | "close") => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onWindowAction }) => {
  return (
    <Box
      h="100%"
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        WebkitAppRegion: "drag",
      }}
    >
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        {/* App Title */}
        <Group gap="sm">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Box
              w={28}
              h={28}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <Text
                size="xs"
                fw={700}
                c="white"
                style={{ fontFamily: "monospace" }}
              >
                E
              </Text>
            </Box>
          </motion.div>

          <Text size="sm" fw={600} c="white" style={{ letterSpacing: "0.5px" }}>
            EKD Clean
          </Text>
        </Group>

        {/* Window Controls */}
        <Group gap="xs" style={{ WebkitAppRegion: "no-drag" }}>
          <Tooltip label="Minimize" position="bottom">
            <ActionIcon
              variant="subtle"
              size="sm"
              c="white"
              onClick={() => onWindowAction("minimize")}
              style={{
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <rect x="2" y="5" width="8" height="2" rx="1" />
              </svg>
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Maximize" position="bottom">
            <ActionIcon
              variant="subtle"
              size="sm"
              c="white"
              onClick={() => onWindowAction("maximize")}
              style={{
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <rect
                  x="2"
                  y="2"
                  width="8"
                  height="8"
                  rx="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Close" position="bottom">
            <ActionIcon
              variant="subtle"
              size="sm"
              c="white"
              onClick={() => onWindowAction("close")}
              style={{
                "&:hover": {
                  backgroundColor: "rgba(255, 77, 77, 0.3)",
                },
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path
                  d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
};
