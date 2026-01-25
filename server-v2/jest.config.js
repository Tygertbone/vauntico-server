/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/types/(.*)$": "<rootDir>/node_modules/@types/$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.json",
    },
  },
  testTimeout: 10000,
};
