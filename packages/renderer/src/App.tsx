// EKD Clean - Main Applimport { SystemInfo } from '../../shared/types';cation Component
// Built by EKD Digital

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@mantine/core";
import { SystemInfo } from "./types";
import { MainDashboard } from "./components/MainDashboard";
import { LoadingScreen } from "./components/LoadingScreen";

const App: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  //

  useEffect(() => {
    // Initialize app and load system information
    const initializeApp = async () => {
      try {
        // Simulate loading time for smooth UX
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Get system information
        if (window.electronAPI?.getSystemInfo) {
          const info = await window.electronAPI.getSystemInfo();
          setSystemInfo(info);
        } else {
          // Fallback system info for testing
          console.warn("ElectronAPI not available, using fallback data");
          setSystemInfo({
            platform: "darwin",
            arch: "x64",
            totalMemory: 8589934592,
            freeMemory: 4294967296,
            cpuCount: 8,
            osVersion: "macOS 14.0",
            nodeVersion: "22.16.0",
            electronVersion: "32.0.1",
            appVersion: "1.0.0",
            uptime: 86400,
            loadAverage: [1.2, 1.5, 1.3],
            homeDirectory: "/Users/user",
            tempDirectory: "/tmp",
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // Still show the app even if system info fails
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      padding={0}
      style={{
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 25%, #3d2914 50%, #1f1f1f 75%, #0f0f0f 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        minHeight: "100vh",
      }}
    >
      {/* Main Content */}
      <AppShell.Main style={{ height: "100vh", overflow: "hidden" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%" }}
        >
          <MainDashboard
            systemInfo={systemInfo}
            isScanning={isScanning}
            onStartScan={() => setIsScanning(!isScanning)}
          />
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
