import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { Database } from './database/database';
import { AuthRoutes } from './routes/auth';
import { SyncRoutes } from './routes/sync';
import { ListRoutes } from './routes/lists';
import { SystemRoutes } from './routes/system';
import { SyncScheduler } from './services/syncScheduler';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Load environment variables
dotenv.config();

class Server {
  private app: express.Application;
  private httpServer: any;
  private io: SocketServer;
  private database: Database;
  private syncScheduler: SyncScheduler;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.database = new Database();
    this.syncScheduler = new SyncScheduler(this.io);
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static files (frontend)
    this.app.use(express.static('public'));
  }

  private setupRoutes(): void {
    // Health check (no auth required)
    this.app.use('/api/system', new SystemRoutes().router);

    // API routes with authentication
    this.app.use('/api/auth', new AuthRoutes(this.database).router);
    this.app.use('/api/sync', authMiddleware, new SyncRoutes(this.database, this.syncScheduler).router);
    this.app.use('/api/lists', authMiddleware, new ListRoutes(this.database).router);

    // Catch-all for SPA routing
    this.app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'public' });
    });

    // Error handling
    this.app.use(errorHandler);
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('join-sync-updates', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined sync updates room`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await this.database.initialize();
      logger.info('Database initialized successfully');

      // Setup middleware and routes
      this.setupMiddleware();
      this.setupRoutes();
      this.setupSocketHandlers();

      // Start sync scheduler
      await this.syncScheduler.start();
      logger.info('Sync scheduler started');

      // Start server
      const port = process.env.PORT || 3000;
      this.httpServer.listen(port, () => {
        logger.info(`MALSync server running on port ${port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    logger.info('Shutting down server...');
    
    await this.syncScheduler.stop();
    await this.database.close();
    
    this.httpServer.close(() => {
      logger.info('Server shut down complete');
      process.exit(0);
    });
  }
}

// Handle graceful shutdown
const server = new Server();

process.on('SIGTERM', () => server.stop());
process.on('SIGINT', () => server.stop());

// Start the server
server.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default server;
