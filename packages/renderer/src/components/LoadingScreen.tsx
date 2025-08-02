// EKD Clean - Loading Screen Component
// Built by EKD Digital

import React from "react";
import { motion } from "framer-motion";
import { Box, Text, Progress, Stack, Center } from "@mantine/core";

export const LoadingScreen: React.FC = () => {
  return (
    <Center
      h="100vh"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Stack align="center" gap="xl">
          {/* Logo Area */}
          <motion.div
            animate={{
              rotateY: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Box
              w={80}
              h={80}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <Text
                size="xl"
                fw={700}
                c="white"
                style={{ fontFamily: "monospace" }}
              >
                EKD
              </Text>
            </Box>
          </motion.div>

          {/* App Name */}
          <Stack align="center" gap="xs">
            <Text
              size="2rem"
              fw={600}
              c="white"
              style={{ letterSpacing: "0.5px" }}
            >
              EKD Clean
            </Text>
            <Text
              size="sm"
              c="rgba(255, 255, 255, 0.8)"
              style={{ letterSpacing: "1px" }}
            >
              System Optimization Suite
            </Text>
          </Stack>

          {/* Loading Progress */}
          <Box w={300}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <Progress
                value={100}
                size="sm"
                radius="xl"
                color="white"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
              />
            </motion.div>
          </Box>

          {/* Loading Text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Text
              size="sm"
              c="rgba(255, 255, 255, 0.9)"
              style={{ letterSpacing: "0.5px" }}
            >
              Initializing system scan...
            </Text>
          </motion.div>
        </Stack>
      </motion.div>
    </Center>
  );
};
