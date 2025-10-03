// EKD Clean - Main Application Component
// Built by EKD Digital

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@mantine/core";
import { MainDashboard } from "./components/MainDashboard";
import { SystemJunkView } from "./components/views/SystemJunkView";
import { ScannerView } from "./components/views/ScannerView";
import { ComingSoonView } from "./components/views/ComingSoonView";
import { Sidebar } from "./components/Sidebar";
import { LoadingScreen } from "./components/LoadingScreen";
import { Camera, Mail, Trash, Package, Shield, Zap } from "lucide-react";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState("smart-scan");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initialize app with smooth loading animation
    const initializeApp = async () => {
      try {
        // Simulate loading time for smooth UX
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // Still show the app even if initialization fails
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
      case "photo-junk":
        return (
          <ScannerView
            config={{
              scannerId: "photo-junk",
              title: "Photo Junk",
              description:
                "Find and remove duplicate photos, thumbnails, and photo caches",
              icon: <Camera className="w-6 h-6 text-white" />,
              gradient: "from-blue-500 to-purple-600",
              textGradient: "from-blue-600 to-purple-700",
            }}
          />
        );
      case "mail-attachments":
        return (
          <ScannerView
            config={{
              scannerId: "mail-attachments",
              title: "Mail Attachments",
              description: "Clean up large email attachments and downloads",
              icon: <Mail className="w-6 h-6 text-white" />,
              gradient: "from-green-500 to-teal-600",
              textGradient: "from-green-600 to-teal-700",
            }}
          />
        );
      case "trash-bins":
        return (
          <ScannerView
            config={{
              scannerId: "trash-bins",
              title: "Trash Bins",
              description: "Empty all trash bins across your system",
              icon: <Trash className="w-6 h-6 text-white" />,
              gradient: "from-red-500 to-orange-600",
              textGradient: "from-red-600 to-orange-700",
            }}
          />
        );
      case "large-old-files":
        return (
          <ScannerView
            config={{
              scannerId: "large-old-files",
              title: "Large & Old Files",
              description: "Find files over 100MB or older than 90 days",
              icon: <Package className="w-6 h-6 text-white" />,
              gradient: "from-yellow-500 to-orange-600",
              textGradient: "from-yellow-600 to-orange-700",
            }}
          />
        );
      case "privacy":
        return (
          <ScannerView
            config={{
              scannerId: "privacy",
              title: "Privacy",
              description: "Clear browser data, logs, and recent files",
              icon: <Shield className="w-6 h-6 text-white" />,
              gradient: "from-indigo-500 to-purple-600",
              textGradient: "from-indigo-600 to-purple-700",
            }}
          />
        );
      case "speed":
        return (
          <ScannerView
            config={{
              scannerId: "speed",
              title: "Speed Optimization",
              description: "Optimize startup items and background services",
              icon: <Zap className="w-6 h-6 text-white" />,
              gradient: "from-cyan-500 to-blue-600",
              textGradient: "from-cyan-600 to-blue-700",
            }}
          />
        );
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
