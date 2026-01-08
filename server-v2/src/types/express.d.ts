import 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        id: string;
        tier: string;
        username?: string;
      };
    }
  }
}

export {};
