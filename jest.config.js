module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/*.d.ts',
    '!packages/**/node_modules/**',
    '!packages/**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@ekd-clean/(.*)$': '<rootDir>/packages/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
