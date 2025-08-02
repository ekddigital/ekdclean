// EKD Clean - Main Dashboard Layout
// Built by EKD Digital - Superior to CleanMyMac

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  HardDrive, 
  Clock,
  ChevronRight 
} from "lucide-react";
import { ScanResult, ActivityItem } from "../types";
import { SoundManager } from "../utils/SoundManager";

interface MainDashboardProps {
  activeItem: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ activeItem }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const soundManager = SoundManager.getInstance();

  // Mock activity data for now
  const activityHistory: ActivityItem[] = [
    {
      id: "1",
      type: "clean",
      title: "System Cache Cleaned",
      description: "2.4 GB recovered",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      size: 2400000000,
      status: "completed",
    },
    {
      id: "2", 
      type: "scan",
      title: "Smart Scan Completed",
      description: "12 issues identified",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "completed",
    },
    {
      id: "3",
      type: "optimize",
      title: "System Optimized", 
      description: "Performance improved by 15%",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: "completed",
    }
  ];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      soundManager.playClick();
      
      // Simple progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsScanning(false);
            soundManager.playSuccess();
            
            // Mock scan results
            setScanResults({
              totalIssues: 15,
              totalSize: 3500000000,
              categories: {
                cache: { count: 8, size: 2100000000 },
                logs: { count: 4, size: 890000000 },
                temp: { count: 3, size: 510000000 }
              }
            });
            
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
    } catch (error) {
      console.error("Scan failed:", error);
      soundManager.playError();
      setIsScanning(false);
    }
  };

  const handleCleanUp = async () => {
    if (!scanResults) return;
    
    try {
      soundManager.playClick();
      // Mock cleanup - reset results
      setScanResults(null);
      setScanProgress(0);
      soundManager.playSuccess();
    } catch (error) {
      console.error("Cleanup failed:", error);
      soundManager.playError();
    }
  };

  const renderSmartScan = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Smart Scan</h2>
        <p className="text-gold-200">
          Analyze your system and identify optimization opportunities
        </p>
      </div>

      {/* Scan Control */}
      <div className="bg-black/20 backdrop-blur-sm border border-gold-500/20 rounded-2xl p-8">
        {!scanResults && scanProgress === 0 && (
          <div className="text-center">
            <motion.button
              onClick={handleStartScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold py-4 px-8 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                {isScanning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                {isScanning ? "Scanning..." : "Start Smart Scan"}
              </div>
            </motion.button>
          </div>
        )}

        {/* Progress */}
        {isScanning && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gold-200">
              <span>Scanning...</span>
              <span>{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-gold-500 to-gold-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ type: "spring", damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {scanResults && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Scan Complete
              </h3>
              <p className="text-gold-200">
                Found {scanResults.totalIssues} issues • {formatBytes(scanResults.totalSize)} can be recovered
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-gold-500/20">
                <div className="text-sm text-gold-200 mb-1">Cache Files</div>
                <div className="text-white font-semibold">
                  {scanResults.categories.cache.count} items • {formatBytes(scanResults.categories.cache.size)}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-gold-500/20">
                <div className="text-sm text-gold-200 mb-1">Log Files</div>
                <div className="text-white font-semibold">
                  {scanResults.categories.logs.count} items • {formatBytes(scanResults.categories.logs.size)}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-gold-500/20">
                <div className="text-sm text-gold-200 mb-1">Temp Files</div>
                <div className="text-white font-semibold">
                  {scanResults.categories.temp.count} items • {formatBytes(scanResults.categories.temp.size)}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={handleCleanUp}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold py-3 px-6 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Clean Up
                </div>
              </motion.button>
              <motion.button
                onClick={() => {
                  setScanResults(null);
                  setScanProgress(0);
                }}
                className="bg-black/30 hover:bg-black/40 text-gold-300 font-semibold py-3 px-6 rounded-xl border border-gold-500/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Scan Again
                </div>
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityHistory = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
      <div className="space-y-3">
        {activityHistory.map((item) => (
          <motion.div
            key={item.id}
            className="bg-black/20 backdrop-blur-sm border border-gold-500/20 rounded-xl p-4 hover:bg-black/30 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                  {item.type === "clean" && <Trash2 className="w-5 h-5 text-black" />}
                  {item.type === "scan" && <HardDrive className="w-5 h-5 text-black" />}
                  {item.type === "optimize" && <RotateCcw className="w-5 h-5 text-black" />}
                </div>
                <div>
                  <div className="text-white font-medium">{item.title}</div>
                  <div className="text-gold-200 text-sm">{item.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gold-200 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(item.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeItem) {
      case "smart-scan":
        return renderSmartScan();
      case "system-junk":
        return <div className="text-white text-center py-16">System Junk Scanner - Coming Soon</div>;
      case "photo-cleaner":
        return <div className="text-white text-center py-16">Photo Cleaner - Coming Soon</div>;
      case "large-files":
        return <div className="text-white text-center py-16">Large Files Finder - Coming Soon</div>;
      case "privacy":
        return <div className="text-white text-center py-16">Privacy Protection - Coming Soon</div>;
      case "performance":
        return <div className="text-white text-center py-16">Performance Monitor - Coming Soon</div>;
      case "malware":
        return <div className="text-white text-center py-16">Malware Scanner - Coming Soon</div>;
      case "activity":
        return renderActivityHistory();
      default:
        return renderSmartScan();
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};
  

  // Load real activity history on component mount
  useEffect(() => {
    const loadActivityHistory = async () => {
      try {
        if (window.electronAPI?.getActivityHistory) {
          const history = await window.electronAPI.getActivityHistory();
          setActivityHistory(history);
        } else {
          // Fallback activity data
          setActivityHistory([
            {
              id: "1",
              type: "clean",
              title: "System Cache Cleaned",
              description: "2.4 GB recovered",
              timestamp: new Date(Date.now() - 2 * 60 * 1000),
              size: 2400000000,
              status: "completed",
            },
            {
              id: "2",
              type: "scan",
              title: "Smart Scan Completed",
              description: "12 issues identified",
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
              status: "completed",
            },
            {
              id: "3",
              type: "optimize",
              title: "System Optimized",
              description: "Performance improved by 15%",
              timestamp: new Date(Date.now() - 10 * 60 * 1000),
              status: "completed",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load activity history:", error);
      }
    };

    loadActivityHistory();
  }, []);

  // Setup real-time scan progress monitoring
  useEffect(() => {
    if (window.electronAPI?.onScanProgress) {
      window.electronAPI.onScanProgress(({ progress, currentFile }) => {
        setScanProgress(progress);
        setCurrentFile(currentFile);
      });
    }

    if (window.electronAPI?.onScanComplete) {
      window.electronAPI.onScanComplete((results) => {
        setScanResults(results);
        setScanProgress(100);
      });
    }
  }, []);

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
    setScanResults(null);

    onStartScan();

    try {
      if (window.electronAPI?.startScan) {
        // Start real scan
        await window.electronAPI.startScan([
          "cache",
          "temp",
          "logs",
          "downloads",
        ]);
      } else {
        // Fallback simulation
        const interval = setInterval(() => {
          setScanProgress((prev) => {
            const newProgress = prev + Math.random() * 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              // Simulate scan results
              setScanResults({
                junkFiles: [],
                totalSize: 1024 * 1024 * 1024 * 2.4, // 2.4GB
                categories: {
                  cache: { count: 45, size: 1024 * 1024 * 800 },
                  temp: { count: 23, size: 1024 * 1024 * 600 },
                  logs: { count: 12, size: 1024 * 1024 * 400 },
                  downloads: { count: 8, size: 1024 * 1024 * 300 },
                  trash: { count: 5, size: 1024 * 1024 * 200 },
                  duplicates: { count: 3, size: 1024 * 1024 * 100 },
                  system: { count: 2, size: 1024 * 1024 * 50 },
                },
                scanDuration: 5000,
                timestamp: new Date(),
              });
              return 100;
            }
            return newProgress;
          });
        }, 300);
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
  }; // EKD Digital gold-inspired glass card styling
  const ekdGlassCardStyle = {
    background: "rgba(15, 15, 15, 0.3)", // Dark background with transparency
    backdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(245, 158, 11, 0.2)", // EKD Gold border
    boxShadow:
      "0 8px 32px rgba(245, 158, 11, 0.08), 0 2px 16px rgba(217, 119, 6, 0.06)",
  };

  const ekdPrimaryGlassStyle = {
    background:
      "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)",
    backdropFilter: "blur(24px) saturate(200%)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    boxShadow:
      "0 12px 40px rgba(59, 130, 246, 0.15), 0 4px 20px rgba(124, 58, 237, 0.1)",
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
            className="space-y-8"
          >
            {/* 1. Hero Section - Smart Scan */}
            <Card padding="2xl" radius="2xl" style={ekdPrimaryGlassStyle}>
              <Stack gap="xl" align="center">
                <motion.div
                  animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 2,
                    repeat: isScanning ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30"
                >
                  <span className="text-white text-4xl">🔍</span>
                </motion.div>

                <div className="text-center">
                  <Title order={1} c="white" mb="md" className="text-shadow-lg">
                    Smart Scan
                  </Title>
                  <Text c="rgba(59, 130, 246, 0.9)" size="xl" fw={500}>
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
                      background: "linear-gradient(45deg, #3b82f6, #7c3aed)",
                      border: "none",
                      minWidth: "220px",
                      padding: "18px 36px",
                      fontSize: "18px",
                      fontWeight: 600,
                      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    {isScanning ? "Scanning System..." : "Start Smart Scan"}
                  </Button>
                </motion.div>
              </Stack>
            </Card>

            {/* 2-4. System Overview Grid - Memory, System Info, Scan Results */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
              {/* 2. Memory Usage */}
              <Card padding="xl" radius="2xl" style={ekdGlassCardStyle}>
                <Stack align="center" gap="lg">
                  <RingProgress
                    size={140}
                    thickness={10}
                    sections={[
                      {
                        value: getMemoryUsagePercentage(),
                        color:
                          getMemoryUsagePercentage() > 80
                            ? "#ef4444" // Red for high usage
                            : getMemoryUsagePercentage() > 60
                              ? "#f59e0b" // Amber for medium
                              : "#3b82f6", // EKD Blue for normal
                      },
                    ]}
                    label={
                      <Text
                        ta="center"
                        size="xl"
                        c="white"
                        fw={700}
                        className="text-shadow"
                      >
                        {getMemoryUsagePercentage()}%
                      </Text>
                    }
                  />
                  <div className="text-center">
                    <Text size="lg" fw={700} c="white" className="text-shadow">
                      Memory Usage
                    </Text>
                    {systemInfo && (
                      <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                        {formatBytes(
                          systemInfo.totalMemory - systemInfo.freeMemory
                        )}{" "}
                        / {formatBytes(systemInfo.totalMemory)}
                      </Text>
                    )}
                  </div>
                </Stack>
              </Card>

              {/* 3. System Info */}
              <Card padding="xl" radius="2xl" style={ekdGlassCardStyle}>
                <Stack gap="lg">
                  <Text
                    size="lg"
                    fw={700}
                    c="white"
                    ta="center"
                    className="text-shadow"
                  >
                    System Info
                  </Text>
                  {systemInfo && (
                    <Stack gap="md">
                      <Group justify="apart">
                        <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                          Platform
                        </Text>
                        <Text size="sm" fw={600} c="white">
                          {systemInfo.platform}
                        </Text>
                      </Group>
                      <Group justify="apart">
                        <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                          CPU Cores
                        </Text>
                        <Text size="sm" fw={600} c="white">
                          {systemInfo.cpuCount}
                        </Text>
                      </Group>
                      <Group justify="apart">
                        <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                          Architecture
                        </Text>
                        <Text size="sm" fw={600} c="white">
                          {systemInfo.arch}
                        </Text>
                      </Group>
                      <Group justify="apart">
                        <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                          App Version
                        </Text>
                        <Text size="sm" fw={600} c="white">
                          {systemInfo.electronVersion}
                        </Text>
                      </Group>
                    </Stack>
                  )}
                </Stack>
              </Card>

              {/* 4. Scan Results */}
              <Card padding="xl" radius="2xl" style={ekdGlassCardStyle}>
                <Stack gap="lg" align="center">
                  <Text size="lg" fw={700} c="white" className="text-shadow">
                    Scan Results
                  </Text>

                  {isScanning ? (
                    <motion.div className="w-full">
                      <Stack gap="lg">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto shadow-lg shadow-blue-500/25"
                        />
                        <Progress
                          value={scanProgress}
                          size="xl"
                          radius="xl"
                          style={{
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                          }}
                          color="#3b82f6"
                          striped
                          animated
                        />
                        <Text
                          size="sm"
                          c="rgba(59, 130, 246, 0.9)"
                          ta="center"
                          fw={500}
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
                      <Stack align="center" gap="md">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Text
                            size="5xl"
                            fw={800}
                            c="white"
                            className="text-shadow-lg"
                          >
                            {scanResults
                              ? Object.values(scanResults.categories).reduce(
                                  (sum, cat) => sum + cat.count,
                                  0
                                )
                              : 0}
                          </Text>
                        </motion.div>
                        <Text size="md" c="rgba(245, 158, 11, 0.9)" fw={600}>
                          Issues Found
                        </Text>
                        <Button
                          variant="gradient"
                          gradient={{ from: "#f59e0b", to: "#ea580c" }}
                          radius="xl"
                          size="md"
                          style={{
                            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          Clean Now
                        </Button>
                      </Stack>
                    </motion.div>
                  )}
                </Stack>
              </Card>
            </SimpleGrid>

            {/* 5. Recent Activity Section */}
            <Card padding="2xl" radius="2xl" style={ekdGlassCardStyle}>
              <Stack gap="xl">
                <Title order={2} c="white" className="text-shadow">
                  Recent Activity
                </Title>
                <Stack gap="xl">
                  <Group
                    justify="apart"
                    align="center"
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
                  >
                    <Group align="center" gap="lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                        <span className="text-white text-lg">✓</span>
                      </div>
                      <div>
                        <Text c="white" fw={600} size="md">
                          System Cache Cleaned
                        </Text>
                        <Text size="sm" c="rgba(34, 197, 94, 0.8)" fw={500}>
                          2.4 GB recovered
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" c="rgba(59, 130, 246, 0.7)" fw={500}>
                      2 minutes ago
                    </Text>
                  </Group>

                  <Group
                    justify="apart"
                    align="center"
                    className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                  >
                    <Group align="center" gap="lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="text-white text-lg">🔍</span>
                      </div>
                      <div>
                        <Text c="white" fw={600} size="md">
                          Smart Scan Completed
                        </Text>
                        <Text size="sm" c="rgba(59, 130, 246, 0.8)" fw={500}>
                          12 issues identified
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" c="rgba(59, 130, 246, 0.7)" fw={500}>
                      5 minutes ago
                    </Text>
                  </Group>

                  <Group
                    justify="apart"
                    align="center"
                    className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
                  >
                    <Group align="center" gap="lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <span className="text-white text-lg">⚡</span>
                      </div>
                      <div>
                        <Text c="white" fw={600} size="md">
                          System Optimized
                        </Text>
                        <Text size="sm" c="rgba(124, 58, 237, 0.8)" fw={500}>
                          Performance improved by 15%
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" c="rgba(59, 130, 246, 0.7)" fw={500}>
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
            <Card padding="2xl" radius="2xl" style={ekdGlassCardStyle}>
              <Stack align="center" gap="xl">
                <div className="text-8xl">🚧</div>
                <Title order={2} c="white" ta="center" className="text-shadow">
                  {activeItem
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Title>
                <Text
                  c="rgba(59, 130, 246, 0.9)"
                  ta="center"
                  size="lg"
                  fw={500}
                >
                  This feature is coming soon! Stay tuned for advanced
                  optimization tools.
                </Text>
                <Button
                  variant="gradient"
                  gradient={{ from: "#3b82f6", to: "#7c3aed" }}
                  radius="xl"
                  size="lg"
                  style={{
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                  }}
                >
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
