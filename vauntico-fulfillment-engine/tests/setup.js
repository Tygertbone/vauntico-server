// Jest setup file for vauntico-fulfillment-engine
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.AIRTABLE_API_KEY = 'test-key';
process.env.AIRTABLE_BASE_ID = 'test-base';
process.env.RESEND_API_KEY = 'test-key';

// Mock external services
jest.mock('airtable', () => ({
  base: jest.fn().mockImplementation(() => ({
    table: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        firstPage: jest.fn().mockResolvedValue([]),
      }),
      create: jest.fn().mockResolvedValue({ id: 'test-id' }),
      update: jest.fn().mockResolvedValue({ id: 'test-id' }),
      destroy: jest.fn().mockResolvedValue({ deleted: true }),
    })),
  })),
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

// Global test timeout
jest.setTimeout(10000);
