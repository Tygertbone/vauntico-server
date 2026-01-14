// Jest global teardown file for server-v2
import { jest } from "@jest/globals";

// Global test teardown runs once after all tests
export default async function globalTeardown() {
  console.log("🧹 Cleaning up test environment...");

  // Restore original console methods
  if ((global as any).__originalConsoleLog) {
    console.log = (global as any).__originalConsoleLog;
  }
  if ((global as any).__originalConsoleWarn) {
    console.warn = (global as any).__originalConsoleWarn;
  }
  if ((global as any).__originalConsoleError) {
    console.error = (global as any).__originalConsoleError;
  }

  // Clear all mocks
  jest.clearAllMocks();
  jest.restoreAllMocks();

  // Close any remaining database connections
  try {
    // Force garbage collection to help with cleanup
    if (global.gc) {
      global.gc();
    }

    // Wait a bit for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("✅ Global test teardown completed");
  } catch (error) {
    console.error("❌ Error during global teardown:", error);
  }
}
