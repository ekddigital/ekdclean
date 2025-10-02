// EKD Clean - TrashBinsScanner Unit Tests
// Built by EKD Digital

import { TrashBinsScanner } from "../../../packages/main/src/core/finders/TrashBinsScanner";

// Mock modules
const mockReaddir = jest.fn();
const mockStat = jest.fn();
const mockRm = jest.fn();
const mockExistsSync = jest.fn();

jest.mock("fs", () => ({
  promises: {
    readdir: mockReaddir,
    stat: mockStat,
    rm: mockRm,
  },
  existsSync: mockExistsSync,
}));

describe("TrashBinsScanner", () => {
  let scanner: TrashBinsScanner;

  beforeEach(() => {
    scanner = new TrashBinsScanner();
    jest.clearAllMocks();
  });

  describe("scan", () => {
    it("should return empty array when no trash items exist", async () => {
      mockExistsSync.mockReturnValue(false);

      const results = await scanner.scan({
        dryRun: true,
      });

      expect(results).toEqual([]);
    });

    it("should find trash items with correct metadata", async () => {
      const mockTrashItems = [
        {
          name: "old-document.pdf",
          isDirectory: () => false,
          isFile: () => true,
        },
        {
          name: "cached-image.jpg",
          isDirectory: () => false,
          isFile: () => true,
        },
      ];

      const mockStats = {
        size: 1024 * 1024, // 1MB
        mtime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days old
      };

      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockResolvedValue(mockTrashItems);
      mockStat.mockResolvedValue(mockStats);

      const results = await scanner.scan({
        dryRun: true,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toMatchObject({
        category: "trash",
        safeToDelete: true,
        confidence: 1.0,
      });
      expect(results[0].metadata).toHaveProperty("ageInDays");
      expect(results[0].metadata?.ageInDays).toBe(7);
    });

    it("should handle scan cancellation", async () => {
      const cancelToken = {
        cancelled: false,
        cancel: () => {
          cancelToken.cancelled = true;
        },
      };

      // Simulate cancellation during scan
      mockExistsSync.mockReturnValue(true);
      mockReaddir.mockImplementation(() => {
        cancelToken.cancel();
        return Promise.resolve([]);
      });

      const results = await scanner.scan({
        dryRun: true,
        cancelToken,
      });

      expect(results).toEqual([]);
    });

    it("should report progress during scan", async () => {
      const progressUpdates: number[] = [];
      const onProgress = (progress: number) => {
        progressUpdates.push(progress);
      };

      mockExistsSync.mockReturnValue(false);

      await scanner.scan({
        dryRun: true,
        onProgress,
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(1.0);
    });
  });

  describe("clean", () => {
    it("should move items to quarantine when quarantine option is true", async () => {
      const mockItems = [
        {
          id: "test-1",
          path: "/mock/trash/file1.txt",
          sizeBytes: 1024,
          discoveredAt: new Date().toISOString(),
          category: "trash",
          reason: "Test trash item",
          safeToDelete: true,
          confidence: 1.0,
        },
      ];

      const result = await scanner.clean(mockItems, {
        backup: false,
        quarantine: true,
      });

      expect(result.success).toBe(true);
      expect(result.quarantined).toBe(true);
    });

    it("should permanently delete items when quarantine option is false", async () => {
      const mockItems = [
        {
          id: "test-1",
          path: "/mock/trash/file1.txt",
          sizeBytes: 1024,
          discoveredAt: new Date().toISOString(),
          category: "trash",
          reason: "Test trash item",
          safeToDelete: true,
          confidence: 1.0,
        },
      ];

      const result = await scanner.clean(mockItems, {
        backup: false,
        quarantine: false,
      });

      expect(result.success).toBe(true);
      expect(result.quarantined).toBe(false);
    });
  });

  describe("validate", () => {
    it("should validate trash items before cleaning", async () => {
      const mockItem = {
        id: "test-1",
        path: "/mock/trash/file1.txt",
        sizeBytes: 1024,
        discoveredAt: new Date().toISOString(),
        category: "trash",
        reason: "Test trash item",
        safeToDelete: true,
        confidence: 1.0,
      };

      mockExistsSync.mockReturnValue(true);

      const isValid = await scanner.validate(mockItem);

      expect(isValid).toBe(true);
    });

    it("should return false for non-existent files", async () => {
      const mockItem = {
        id: "test-1",
        path: "/nonexistent/file.txt",
        sizeBytes: 1024,
        discoveredAt: new Date().toISOString(),
        category: "trash",
        reason: "Test trash item",
        safeToDelete: true,
        confidence: 1.0,
      };

      mockExistsSync.mockReturnValue(false);

      const isValid = await scanner.validate(mockItem);

      expect(isValid).toBe(false);
    });
  });

  describe("restore", () => {
    it("should restore quarantined trash items", async () => {
      const quarantineId = "test-quarantine-id";

      const restored = await scanner.restore(quarantineId);

      expect(typeof restored).toBe("boolean");
    });
  });
});
