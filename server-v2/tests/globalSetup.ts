// Jest global setup file for server-v2
import { jest } from '@jest/globals';

// Global test setup runs once before all tests
export default async function globalSetup() {
  console.log('🔧 Setting up test environment...');
  
  // Load test environment variables
  process.env.NODE_ENV = 'test';
  
  // Set test timeout
  jest.setTimeout(30000);
  
  // Mock console methods to reduce noise in test output
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  // Override console methods for cleaner test output
  console.log = (...args: any[]) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsoleLog(...args);
    }
  };
  
  console.warn = (...args: any[]) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsoleWarn(...args);
    }
  };
  
  console.error = (...args: any[]) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsoleError(...args);
    }
  };
  
  // Store original methods for cleanup
  (global as any).__originalConsoleLog = originalConsoleLog;
  (global as any).__originalConsoleWarn = originalConsoleWarn;
  (global as any).__originalConsoleError = originalConsoleError;
  
  console.log('✅ Global test setup completed');
}