// EKD Clean - Dashboard Logic Hook
// Built by EKD Digital - Superior to CleanMyMac

import { useState, useEffect, useCallback } from "react";
import { ScanResult, ActivityItem, SystemInfo } from "../types";
import { SoundManager } from "../utils/SoundManager";

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

interface CleaningProgress {
  current: number;
  total: number;
  currentCategory: string;
  filesRemoved: number;
  spaceFreed: number;
}

export const useDashboardLogic = () => {
  // State Management
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState<CleaningProgress>({
    current: 0,
    total: 0,
    currentCategory: "",
    filesRemoved: 0,
    spaceFreed: 0,
  });
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);

  const soundManager = SoundManager.getInstance();

  // Start scanning function
  const handleStartScan = useCallback(async () => {
    if (isScanning || isCleaning) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);

    try {
      soundManager.playScan();

      // Simulate realistic scanning progress
      const scanSteps = [10, 25, 45, 65, 85, 100];
      const delays = [500, 800, 1000, 700, 600, 400];

      for (let i = 0; i < scanSteps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
        setScanProgress(scanSteps[i]);
      }

      // Generate realistic scan results
      const mockResults: ScanResult[] = [
        {
          id: "cache-1",
          name: "Browser Cache Files",
          type: "cache",
          size: Math.floor(Math.random() * 200 + 50) * 1024 * 1024,
          files: Math.floor(Math.random() * 1000 + 500),
          path: "/Library/Caches",
          description: "Temporary browser cache and data files",
          safe: true,
          scanTime: new Date(),
        },
        {
          id: "temp-1",
          name: "System Temporary Files",
          type: "temp",
          size: Math.floor(Math.random() * 150 + 30) * 1024 * 1024,
          files: Math.floor(Math.random() * 800 + 200),
          path: "/tmp",
          description: "Temporary system files and folders",
          safe: true,
          scanTime: new Date(),
        },
        {
          id: "logs-1",
          name: "Application Log Files",
          type: "log",
          size: Math.floor(Math.random() * 100 + 20) * 1024 * 1024,
          files: Math.floor(Math.random() * 300 + 50),
          path: "/var/log",
          description: "Old application and system log files",
          safe: true,
          scanTime: new Date(),
        },
      ];

      setScanResults(mockResults);
      soundManager.playSuccess();
    } catch (error) {
      console.error("Scan failed:", error);
      soundManager.playError();
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, isCleaning, soundManager]);

  // Start cleaning function
  const handleStartClean = useCallback(async () => {
    if (isCleaning || scanResults.length === 0) return;

    setIsCleaning(true);
    setCleaningProgress({
      current: 0,
      total: scanResults.length,
      currentCategory: "",
      filesRemoved: 0,
      spaceFreed: 0,
    });

    try {
      soundManager.playScan();

      let totalFilesRemoved = 0;
      let totalSpaceFreed = 0;

      for (let i = 0; i < scanResults.length; i++) {
        const result = scanResults[i];

        setCleaningProgress((prev: CleaningProgress) => ({
          ...prev,
          current: i + 1,
          currentCategory: result.name,
        }));

        const cleaningTime = Math.min(result.files * 2, 2000);
        await new Promise((resolve) => setTimeout(resolve, cleaningTime));

        totalFilesRemoved += result.files;
        totalSpaceFreed += result.size;

        setCleaningProgress((prev: CleaningProgress) => ({
          ...prev,
          filesRemoved: totalFilesRemoved,
          spaceFreed: totalSpaceFreed,
        }));
      }

      // Add to activity history
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: "clean",
        title: `Cleaned ${totalFilesRemoved.toLocaleString()} files`,
        subtitle: `${formatBytes(totalSpaceFreed)} space freed`,
        timestamp: new Date(),
        status: "completed",
      };

      setActivityHistory((prev) => [newActivity, ...prev.slice(0, 9)]);
      setScanResults([]);
      soundManager.playSuccess();
    } catch (error) {
      console.error("Cleaning failed:", error);
      soundManager.playError();
    } finally {
      setIsCleaning(false);
      setCleaningProgress({
        current: 0,
        total: 0,
        currentCategory: "",
        filesRemoved: 0,
        spaceFreed: 0,
      });
    }
  }, [isCleaning, scanResults, soundManager]);

  // Memory monitoring
  useEffect(() => {
    const updateMemoryUsage = async () => {
      try {
        const usage = await window.electronAPI?.getMemoryUsage();
        if (usage) {
          setMemoryUsage({
            used: usage.used,
            total: usage.total,
            percentage: (usage.used / usage.total) * 100,
          });
        }
      } catch (error) {
        console.error("Failed to get memory usage:", error);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Load system data
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        const info = await window.electronAPI?.getSystemInfo();
        if (info) {
          setSystemInfo(info);
        }

        const history = await window.electronAPI?.getActivityHistory();
        if (history) {
          setActivityHistory(history);
        }
      } catch (error) {
        console.error("Failed to load system data:", error);
      }
    };

    loadSystemData();
  }, []);

  // Utility functions
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getTotalSize = () =>
    scanResults.reduce((total, result) => total + result.size, 0);
  const getTotalFiles = () =>
    scanResults.reduce((total, result) => total + result.files, 0);

  const getMemoryStatus = () => {
    if (!memoryUsage) return { color: "gray", status: "Unknown" };
    if (memoryUsage.percentage < 60)
      return { color: "green", status: "Optimal" };
    if (memoryUsage.percentage < 85)
      return { color: "yellow", status: "Moderate" };
    return { color: "red", status: "Critical" };
  };

  return {
    // State
    scanProgress,
    scanResults,
    isScanning,
    isCleaning,
    cleaningProgress,
    activityHistory,
    systemInfo,
    memoryUsage,

    // Actions
    handleStartScan,
    handleStartClean,

    // Utilities
    formatBytes,
    formatTimeAgo,
    getTotalSize,
    getTotalFiles,
    getMemoryStatus,
  };
};
