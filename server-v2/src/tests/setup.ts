import "@jest/globals";

// Mock global types that might conflict
declare global {
  namespace jest {
    interface Environment {
      node: {
        // Add any missing Jest global properties
        advanceTimersToNextFrame?: (ms?: number) => void;
        onGenerateMock?: () => void;
        unstable_unmockModule?: (moduleName: string) => void;
      };
    }
  }
}

// Setup test environment
beforeAll(() => {
  // Global test setup
});

afterAll(() => {
  // Global test cleanup
});
