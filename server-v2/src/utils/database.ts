/**
 * Database Utility Module
 * Provides database connection and query utilities
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class Database {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Execute a query
   */
  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query within a transaction
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client for manual transaction management
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT NOW()');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Create database instance with environment variables
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vauntico',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

export const database = new Database(dbConfig);

// Export common query helpers
export const sql = {
  /**
   * Build INSERT query
   */
  insert: (table: string, data: Record<string, any>): { text: string; values: any[] } => {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    const text = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const values = keys.map(key => data[key]);
    return { text, values };
  },

  /**
   * Build UPDATE query
   */
  update: (table: string, data: Record<string, any>, where: Record<string, any>): { text: string; values: any[] } => {
    const dataKeys = Object.keys(data);
    const whereKeys = Object.keys(where);

    const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = whereKeys.map((key, i) => `${key} = $${i + dataKeys.length + 1}`).join(' AND ');

    const text = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const values = [...dataKeys.map(key => data[key]), ...whereKeys.map(key => where[key])];

    return { text, values };
  },

  /**
   * Build SELECT query
   */
  select: (table: string, where?: Record<string, any>, limit?: number): { text: string; values: any[] } => {
    let text = `SELECT * FROM ${table}`;
    const values: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const whereKeys = Object.keys(where);
      const whereClause = whereKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      text += ` WHERE ${whereClause}`;
      values.push(...whereKeys.map(key => where[key]));
    }

    if (limit) {
      text += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }

    return { text, values };
  }
};