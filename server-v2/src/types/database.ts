import { Pool, PoolClient } from "pg";

/**
 * Database connection pool interface
 */
export interface DatabasePool extends Pool {
  // Additional pool properties can be added here if needed
}

/**
 * Database connection interface
 */
export interface DatabaseConnection extends PoolClient {
  // Additional client properties can be added here if needed
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  isHealthy: boolean;
  timestamp?: string;
  error?: string;
  connectionCount?: number;
  idleCount?: number;
  waitingCount?: number;
}

/**
 * Token payload interface for JWT tokens
 */
export interface TokenPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

/**
 * Refresh token payload interface
 */
export interface RefreshTokenPayload extends TokenPayload {
  tokenVersion: number;
}
