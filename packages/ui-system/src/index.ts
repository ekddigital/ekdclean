// EKD Clean - UI System Entry Point
// Built by EKD Digital - Superior to CleanMyMac

// Components
export { CircularScanButton } from "./components/CircularScanButton";

// Types
export type {
  ScanState,
  ScanProgress,
  CircularScanButtonProps,
  ScanResult,
  ScannedItem,
} from "./types/scan";

// Re-export commonly used types for convenience
export type { ScanState as ButtonState } from "./types/scan";
