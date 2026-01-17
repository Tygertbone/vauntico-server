module.exports = {
  // Jest configuration for Vauntico TypeScript SDK
  // Enterprise-grade testing setup with comprehensive coverage reporting

  // Project structure
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/*.(test|spec).+(ts|tsx|js)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "/.vscode/",
    "/.git/",
  ],

  // TypeScript compilation
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(axios)/"],

  // Module resolution
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@vauntico/sdk/(.*)$": "<rootDir>/src/$1",
  },

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx,js,jsx}",
    "!src/**/index.ts", // Entry points often have minimal logic
    "!src/**/*.mock.{ts,tsx,js,jsx}",
    "!src/**/*.test.{ts,tsx,js,jsx}",
    "!src/**/*.spec.{ts,tsx,js,jsx}",
    "!src/**/types/**", // Type definitions
    "!src/**/interfaces/**", // TypeScript interfaces
    "!src/**/constants/**", // Constants typically don't need coverage
    "!src/**/*.config.{ts,tsx,js,jsx}", // Configuration files
  ],
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "text-summary",
    "html",
    "lcov",
    "json",
    "clover",
    "cobertura",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-file thresholds for critical components
    "./src/client.ts": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/auth.ts": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./src/api.ts": {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Setup and teardown
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  setupFiles: ["<rootDir>/tests/global-setup.ts"],

  // Mocking
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // Timeout configuration
  testTimeout: 10000,
  bail: false,

  // Verbose output for CI
  verbose: process.env.CI === "true",

  // Reporting
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: true,
      },
    ],
  ],

  // Performance
  maxWorkers: "50%",
  maxConcurrency: 5,

  // Cache configuration
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",

  // Error handling
  errorOnDeprecated: true,
  notify: false,
  notifyMode: "failure-change",

  // Global variables
  globals: {
    "process.env.NODE_ENV": "test",
  },

  // Custom matchers and snapshots
  snapshotSerializers: [],
  testRunner: "jest-circus",

  // Watch mode configuration
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // Coverage collection exclusions
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/dist/",
    "/.vscode/",
    "/.git/",
    "/types/",
    "/interfaces/",
  ],

  // Enterprise-specific settings
  displayName: {
    name: "Vauntico TypeScript SDK",
    color: "cyan",
  },

  // Performance profiling
  collectPerformance: false,

  // Integration test support
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx,js,jsx}"],
      setupFilesAfterEnv: ["<rootDir>/tests/unit-setup.ts"],
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.{ts,tsx,js,jsx}"],
      setupFilesAfterEnv: ["<rootDir>/tests/integration-setup.ts"],
      testTimeout: 30000, // Longer timeout for integration tests
    },
  ],

  // Code quality gates
  passWithNoTests: false, // Require tests
  detectOpenHandles: true,
  detectLeaks: true,
  forceExit: true,

  // Environment variables for tests
  testEnvironmentOptions: {
    url: "http://localhost:3000",
    resources: "usable",
    customExportConditions: ["node", "node-addons"],
  },
};
