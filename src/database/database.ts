import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceToken {
  id: string;
  user_id: string;
  service_name: 'mal' | 'anilist' | 'kitsu' | 'simkl' | 'shikimori';
  access_token: string;
  refresh_token?: string;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SyncHistory {
  id: string;
  user_id: string;
  sync_type: 'manual' | 'scheduled';
  status: 'success' | 'failure' | 'partial';
  started_at: Date;
  completed_at?: Date;
  details: any;
}

export interface SyncConflict {
  id: string;
  user_id: string;
  mal_id: number;
  service_name: string;
  conflict_type: string;
  data: any;
  resolved: boolean;
  created_at: Date;
}

export class Database {
  private db: sqlite3.Database | null = null;
  private pool: Pool | null = null;
  private dbType: 'sqlite' | 'postgresql';

  constructor() {
    this.dbType = (process.env.DATABASE_TYPE as 'sqlite' | 'postgresql') || 'sqlite';
  }

  public async initialize(): Promise<void> {
    if (this.dbType === 'sqlite') {
      await this.initializeSQLite();
    } else {
      await this.initializePostgreSQL();
    }
    
    await this.runMigrations();
    logger.info(`Database initialized (${this.dbType})`);
  }

  private async initializeSQLite(): Promise<void> {
    const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || '/app/data/malsync.db';
    const dbDir = path.dirname(dbPath);
    
    // Ensure directory exists
    await fs.mkdir(dbDir, { recursive: true });
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening SQLite database:', err);
        throw err;
      }
      logger.info(`Connected to SQLite database: ${dbPath}`);
    });

    // Enable foreign keys
    await this.runSQLite('PRAGMA foreign_keys = ON');
  }

  private async initializePostgreSQL(): Promise<void> {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    const client = await this.pool.connect();
    client.release();
    logger.info('Connected to PostgreSQL database');
  }

  private async runMigrations(): Promise<void> {
    const migrations = [
      `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS service_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          service_name TEXT NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(user_id, service_name)
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS sync_history (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          sync_type TEXT NOT NULL,
          status TEXT NOT NULL,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          details TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS sync_conflicts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          mal_id INTEGER NOT NULL,
          service_name TEXT NOT NULL,
          conflict_type TEXT NOT NULL,
          data TEXT NOT NULL,
          resolved BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `
    ];

    for (const migration of migrations) {
      if (this.dbType === 'sqlite') {
        await this.runSQLite(migration);
      } else {
        await this.runPostgreSQL(migration);
      }
    }
  }

  // SQLite methods
  private async runSQLite(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          logger.error('SQLite query error:', err);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  private async getSQLite(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) {
          logger.error('SQLite query error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  private async allSQLite(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('SQLite query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // PostgreSQL methods
  private async runPostgreSQL(sql: string, params: any[] = []): Promise<any> {
    const client = await this.pool!.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Generic database methods
  public async createUser(userId: string): Promise<User> {
    const sql = 'INSERT INTO users (id) VALUES (?) RETURNING *';
    const params = [userId];

    if (this.dbType === 'sqlite') {
      await this.runSQLite(sql.replace('RETURNING *', ''), params);
      return this.getUser(userId);
    } else {
      const result = await this.runPostgreSQL(sql.replace('?', '$1'), params);
      return result.rows[0];
    }
  }

  public async getUser(userId: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const params = [userId];

    if (this.dbType === 'sqlite') {
      return this.getSQLite(sql, params);
    } else {
      const result = await this.runPostgreSQL(sql.replace('?', '$1'), params);
      return result.rows[0] || null;
    }
  }

  public async createServiceToken(token: Omit<ServiceToken, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceToken> {
    const id = this.generateId();
    const sql = `
      INSERT INTO service_tokens (id, user_id, service_name, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [id, token.user_id, token.service_name, token.access_token, token.refresh_token, token.expires_at];

    if (this.dbType === 'sqlite') {
      await this.runSQLite(sql, params);
      return this.getServiceToken(token.user_id, token.service_name);
    } else {
      await this.runPostgreSQL(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      return this.getServiceToken(token.user_id, token.service_name);
    }
  }

  public async getServiceToken(userId: string, serviceName: string): Promise<ServiceToken | null> {
    const sql = 'SELECT * FROM service_tokens WHERE user_id = ? AND service_name = ?';
    const params = [userId, serviceName];

    if (this.dbType === 'sqlite') {
      return this.getSQLite(sql, params);
    } else {
      const result = await this.runPostgreSQL(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      return result.rows[0] || null;
    }
  }

  public async updateServiceToken(userId: string, serviceName: string, updates: Partial<ServiceToken>): Promise<void> {
    const setClause = Object.keys(updates).map((key, i) => `${key} = ?`).join(', ');
    const sql = `UPDATE service_tokens SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND service_name = ?`;
    const params = [...Object.values(updates), userId, serviceName];

    if (this.dbType === 'sqlite') {
      await this.runSQLite(sql, params);
    } else {
      await this.runPostgreSQL(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    }
  }

  public async deleteServiceToken(userId: string, serviceName: string): Promise<void> {
    const sql = 'DELETE FROM service_tokens WHERE user_id = ? AND service_name = ?';
    const params = [userId, serviceName];

    if (this.dbType === 'sqlite') {
      await this.runSQLite(sql, params);
    } else {
      await this.runPostgreSQL(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    }
  }

  public async getUserServiceTokens(userId: string): Promise<ServiceToken[]> {
    const sql = 'SELECT * FROM service_tokens WHERE user_id = ?';
    const params = [userId];

    if (this.dbType === 'sqlite') {
      return this.allSQLite(sql, params);
    } else {
      const result = await this.runPostgreSQL(sql.replace('?', '$1'), params);
      return result.rows;
    }
  }

  public async createSyncHistory(history: Omit<SyncHistory, 'id'>): Promise<SyncHistory> {
    const id = this.generateId();
    const sql = `
      INSERT INTO sync_history (id, user_id, sync_type, status, started_at, completed_at, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      history.user_id,
      history.sync_type,
      history.status,
      history.started_at,
      history.completed_at,
      JSON.stringify(history.details)
    ];

    if (this.dbType === 'sqlite') {
      await this.runSQLite(sql, params);
      return { id, ...history };
    } else {
      await this.runPostgreSQL(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      return { id, ...history };
    }
  }

  public async getSyncHistory(userId: string, limit: number = 50): Promise<SyncHistory[]> {
    const sql = 'SELECT * FROM sync_history WHERE user_id = ? ORDER BY started_at DESC LIMIT ?';
    const params = [userId, limit];

    let results: any[];
    if (this.dbType === 'sqlite') {
      results = await this.allSQLite(sql, params);
    } else {
      const result = await this.runPostgreSQL(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      results = result.rows;
    }

    return results.map(row => ({
      ...row,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public async close(): Promise<void> {
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) {
            logger.error('Error closing SQLite database:', err);
            reject(err);
          } else {
            logger.info('SQLite database closed');
            resolve();
          }
        });
      });
    }

    if (this.pool) {
      await this.pool.end();
      logger.info('PostgreSQL pool closed');
    }
  }
}
