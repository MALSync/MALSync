import cron from 'node-cron';
import { Server as SocketServer } from 'socket.io';
import { Database } from '../database/database';
import { logger } from '../utils/logger';
import { AniListProvider } from '../providers/anilist/provider';

interface UserSyncSchedule {
  enabled: boolean;
  intervalMinutes: number;
  services: string[];
  types: string[];
  lastSync?: Date;
  nextSync?: Date;
}

export class SyncScheduler {
  private io: SocketServer;
  private database: Database;
  private activeUserSyncs: Set<string> = new Set();
  private userSchedules: Map<string, UserSyncSchedule> = new Map();
  private schedulerTask: cron.ScheduledTask | null = null;

  constructor(io: SocketServer) {
    this.io = io;
    this.database = new Database();
  }

  public async start(): Promise<void> {
    logger.info('Starting sync scheduler...');
    
    // Run scheduler every 5 minutes to check for due syncs
    this.schedulerTask = cron.schedule('*/5 * * * *', async () => {
      await this.checkAndRunScheduledSyncs();
    });

    logger.info('Sync scheduler started');
  }

  public async stop(): Promise<void> {
    logger.info('Stopping sync scheduler...');
    
    if (this.schedulerTask) {
      this.schedulerTask.stop();
      this.schedulerTask = null;
    }

    // Wait for active syncs to complete
    while (this.activeUserSyncs.size > 0) {
      logger.info(`Waiting for ${this.activeUserSyncs.size} active syncs to complete...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info('Sync scheduler stopped');
  }

  public async syncUser(userId: string, services?: string[], types?: string[]): Promise<void> {
    if (this.activeUserSyncs.has(userId)) {
      throw new Error('Sync already running for this user');
    }

    this.activeUserSyncs.add(userId);
    this.emitSyncStatus(userId, { status: 'starting', timestamp: new Date() });

    try {
      logger.info(`Starting sync for user ${userId}`);
      
      // Get user's service tokens
      const tokens = await this.database.getUserServiceTokens(userId);
      const connectedServices = tokens.map(t => t.service_name);
      
      // Filter services to sync
      const servicesToSync = services ? 
        services.filter(s => connectedServices.includes(s as any)) : 
        connectedServices;

      const typesToSync = types || ['anime', 'manga'];

      logger.info(`Syncing services: ${servicesToSync.join(', ')} for types: ${typesToSync.join(', ')}`);

      // Create sync history entry
      const syncHistory = await this.database.createSyncHistory({
        user_id: userId,
        sync_type: 'manual',
        status: 'success', // Will be updated
        started_at: new Date(),
        details: {
          services: servicesToSync,
          types: typesToSync,
          progress: 0
        }
      });

      let totalSteps = servicesToSync.length * typesToSync.length;
      let completedSteps = 0;

      // Sync each service and type combination
      for (const service of servicesToSync) {
        for (const type of typesToSync) {
          try {
            this.emitSyncStatus(userId, {
              status: 'syncing',
              service,
              type,
              progress: Math.round((completedSteps / totalSteps) * 100),
              timestamp: new Date()
            });

            await this.syncServiceType(userId, service, type as 'anime' | 'manga');
            completedSteps++;

            this.emitSyncStatus(userId, {
              status: 'syncing',
              service,
              type,
              progress: Math.round((completedSteps / totalSteps) * 100),
              timestamp: new Date()
            });

          } catch (error: any) {
            logger.error(`Sync error for ${service} ${type}:`, error);
            // Continue with other services/types
          }
        }
      }

      // Update sync history as completed
      // Note: This is a simplified implementation
      logger.info(`Sync completed for user ${userId}`);
      
      this.emitSyncStatus(userId, {
        status: 'completed',
        progress: 100,
        timestamp: new Date()
      });

    } catch (error: any) {
      logger.error(`Sync failed for user ${userId}:`, error);
      
      this.emitSyncStatus(userId, {
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      });
      
      throw error;
    } finally {
      this.activeUserSyncs.delete(userId);
    }
  }

  private async syncServiceType(userId: string, service: string, type: 'anime' | 'manga'): Promise<void> {
    const token = await this.database.getServiceToken(userId, service as any);
    if (!token) {
      throw new Error(`No token found for service ${service}`);
    }

    // Create provider instance based on service
    let provider;
    switch (service) {
      case 'anilist':
        provider = new AniListProvider({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          expiresAt: token.expires_at
        });
        break;
      // Add other providers here
      default:
        logger.warn(`Provider ${service} not yet implemented`);
        return;
    }

    // Get list from provider
    const list = await provider.getList(type);
    logger.info(`Retrieved ${list.length} entries from ${service} ${type} list`);

    // Here you would implement the actual sync logic
    // For now, just log the operation
    logger.info(`Would sync ${list.length} ${type} entries for ${service}`);
  }

  public isUserSyncRunning(userId: string): boolean {
    return this.activeUserSyncs.has(userId);
  }

  public async updateUserSchedule(userId: string, schedule: Partial<UserSyncSchedule>): Promise<void> {
    const currentSchedule = this.userSchedules.get(userId) || {
      enabled: false,
      intervalMinutes: 1440, // 24 hours
      services: [],
      types: ['anime', 'manga']
    };

    const updatedSchedule = { ...currentSchedule, ...schedule };
    
    if (updatedSchedule.enabled) {
      updatedSchedule.nextSync = new Date(Date.now() + updatedSchedule.intervalMinutes * 60 * 1000);
    } else {
      updatedSchedule.nextSync = undefined;
    }

    this.userSchedules.set(userId, updatedSchedule);
    logger.info(`Updated sync schedule for user ${userId}:`, updatedSchedule);
  }

  public getNextSyncTime(userId: string): Date | null {
    const schedule = this.userSchedules.get(userId);
    return schedule?.nextSync || null;
  }

  private async checkAndRunScheduledSyncs(): Promise<void> {
    const now = new Date();
    
    for (const [userId, schedule] of this.userSchedules.entries()) {
      if (schedule.enabled && 
          schedule.nextSync && 
          schedule.nextSync <= now && 
          !this.activeUserSyncs.has(userId)) {
        
        logger.info(`Running scheduled sync for user ${userId}`);
        
        try {
          await this.syncUser(userId, schedule.services, schedule.types);
          
          // Schedule next sync
          schedule.lastSync = now;
          schedule.nextSync = new Date(now.getTime() + schedule.intervalMinutes * 60 * 1000);
          
        } catch (error: any) {
          logger.error(`Scheduled sync failed for user ${userId}:`, error);
          
          // Retry in 1 hour
          schedule.nextSync = new Date(now.getTime() + 60 * 60 * 1000);
        }
      }
    }
  }

  private emitSyncStatus(userId: string, status: any): void {
    this.io.to(`user-${userId}`).emit('sync-status', status);
  }
}
