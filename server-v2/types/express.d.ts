import { JWTPayload } from "../src/auth/tokens";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      requestId?: string;
    }
  }
}
