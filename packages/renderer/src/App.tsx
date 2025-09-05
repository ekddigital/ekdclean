// EKD Clean - Main Application Component
// Built by EKD Digital

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@mantine/core";
import { SystemInfo } from "./types";
import { MainDashboard } from "./components/MainDashboard";
import { SystemJunkView } from "./components/views/SystemJunkView";
import { ComingSoonView } from "./components/views/ComingSoonView";
import { Sidebar } from "./components/Sidebar";
import { LoadingScreen } from "./components/LoadingScreen";

const App: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState("smart-scan");
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const renderActiveView = () => {
    const sidebarConfig = {
      "smart-scan": {
        title: "Smart Scan",
        description: "Comprehensive system analysis",
        icon: "🔍",
      },
      "system-junk": {
        title: "System Junk",
        description: "Cache files, logs, and temporary data",
        icon: "🗑️",
      },
      "photo-junk": {
        title: "Photo Junk",
        description: "Duplicate photos and screenshots",
        icon: "📸",
      },
      "mail-attachments": {
        title: "Mail Attachments",
        description: "Large email attachments",
        icon: "📧",
      },
      "trash-bins": {
        title: "Trash Bins",
        description: "Items in various trash locations",
        icon: "🗂️",
      },
      "large-old-files": {
        title: "Large & Old Files",
        description: "Files taking up unnecessary space",
        icon: "📦",
      },
      privacy: {
        title: "Privacy",
        description: "Browser data and sensitive information",
        icon: "🛡️",
      },
      speed: {
        title: "Speed",
        description: "Performance optimization tools",
        icon: "⚡",
      },
    };

    switch (activeItem) {
      case "smart-scan":
        return (
          <MainDashboard activeItem={activeItem} isDarkMode={isDarkMode} />
        );
      case "system-junk":
        return <SystemJunkView />;
      default:
        const config = sidebarConfig[activeItem as keyof typeof sidebarConfig];
        return (
          <ComingSoonView
            title={config?.title || "Feature"}
            description={config?.description || "Coming soon"}
            icon={config?.icon || "🔧"}
            onBack={() => setActiveItem("smart-scan")}
          />
        );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppShell
      padding={0}
      navbar={{ width: 260, breakpoint: "sm" }}
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 25%, #3d2914 50%, #1f1f1f 75%, #0f0f0f 100%)"
          : "linear-gradient(135deg, #f9fafb 0%, #ffffff 25%, #f3f4f6 50%, #e5e7eb 75%, #f9fafb 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        minHeight: "100vh",
      }}
    >
      {/* Sidebar */}
      <AppShell.Navbar
        p="sm"
        style={{
          background: isDarkMode
            ? "rgba(30, 30, 30, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderRight: isDarkMode
            ? "1px solid rgba(245, 158, 11, 0.1)"
            : "1px solid rgba(229, 231, 235, 0.5)",
          padding: "12px",
        }}
      >
        <Sidebar
          activeItem={activeItem}
          onItemSelect={setActiveItem}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main style={{ height: "100vh", overflow: "auto", padding: 0 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", minHeight: "100vh" }}
        >
          {renderActiveView()}
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
