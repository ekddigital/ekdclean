// EKD Clean - Constants
// Built by EKD Digital

export const APP_NAME = 'EKD Clean';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'EKD Digital';

export const SUPPORTED_PLATFORMS = ['win32', 'darwin', 'linux'] as const;

export const SCAN_TYPES = {
  JUNK: 'junk',
  DUPLICATES: 'duplicates',
  LARGE_FILES: 'large-files',
  MALWARE: 'malware',
  CACHES: 'caches',
  BROWSER: 'browser',
  REGISTRY: 'registry', // Windows only
  LAUNCH_AGENTS: 'launch-agents', // macOS only
  PACKAGES: 'packages', // Linux only
} as const;

export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export const THEME_COLORS = {
  LIGHT: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  DARK: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#22d3ee',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
  },
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

export const EASING_FUNCTIONS = {
  EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;
