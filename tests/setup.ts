// Jest setup file
// import '@testing-library/jest-dom';

// Mock Electron APIs
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => `/mock/path/${name}`),
    getVersion: jest.fn(() => '1.0.0'),
  },
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
    invoke: jest.fn(),
  },
}));

// Silence console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
} as Console;
