import { Router, Request, Response } from 'express';
import { Database } from '../database/database';
import { SyncScheduler } from '../services/syncScheduler';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class SyncRoutes {
  public router: Router;
  private database: Database;
  private syncScheduler: SyncScheduler;

  constructor(database: Database, syncScheduler: SyncScheduler) {
    this.router = Router();
    this.database = database;
    this.syncScheduler = syncScheduler;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/manual', this.triggerManualSync.bind(this));
    this.router.get('/status', this.getSyncStatus.bind(this));
    this.router.get('/history', this.getSyncHistory.bind(this));
    this.router.put('/schedule', this.updateSyncSchedule.bind(this));
    this.router.get('/conflicts', this.getSyncConflicts.bind(this));
    this.router.post('/conflicts/:id/resolve', this.resolveSyncConflict.bind(this));
  }

  private async triggerManualSync(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { services, types } = req.body;

      // Validate input
      const validServices = ['mal', 'anilist', 'kitsu', 'simkl', 'shikimori'];
      const validTypes = ['anime', 'manga'];

      const servicesToSync = services?.length ? services.filter((s: string) => validServices.includes(s)) : validServices;
      const typesToSync = types?.length ? types.filter((t: string) => validTypes.includes(t)) : validTypes;

      // Create sync history entry
      const syncHistory = await this.database.createSyncHistory({
        user_id: userId,
        sync_type: 'manual',
        status: 'success', // Will be updated
        started_at: new Date(),
        details: {
          services: servicesToSync,
          types: typesToSync,
          requested_at: new Date(),
        }
      });

      // Start sync in background
      this.syncScheduler.syncUser(userId, servicesToSync, typesToSync).catch(error => {
        logger.error('Manual sync error:', error);
      });

      res.json({
        success: true,
        syncId: syncHistory.id,
        message: 'Sync started',
        services: servicesToSync,
        types: typesToSync
      });
    } catch (error: any) {
      logger.error('Manual sync trigger error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start sync'
      });
    }
  }

  private async getSyncStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      
      // Get current sync status
      const isRunning = this.syncScheduler.isUserSyncRunning(userId);
      const lastSync = await this.getLastSyncForUser(userId);
      
      res.json({
        isRunning,
        lastSync: lastSync ? {
          id: lastSync.id,
          type: lastSync.sync_type,
          status: lastSync.status,
          started_at: lastSync.started_at,
          completed_at: lastSync.completed_at,
          details: lastSync.details
        } : null,
        nextScheduledSync: this.syncScheduler.getNextSyncTime(userId)
      });
    } catch (error: any) {
      logger.error('Sync status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync status'
      });
    }
  }

  private async getSyncHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const history = await this.database.getSyncHistory(userId, limit);
      
      res.json({
        success: true,
        history: history.map(entry => ({
          id: entry.id,
          type: entry.sync_type,
          status: entry.status,
          started_at: entry.started_at,
          completed_at: entry.completed_at,
          duration: entry.completed_at ? 
            new Date(entry.completed_at).getTime() - new Date(entry.started_at).getTime() : null,
          details: entry.details
        }))
      });
    } catch (error: any) {
      logger.error('Sync history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync history'
      });
    }
  }

  private async updateSyncSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { enabled, intervalMinutes, services, types } = req.body;

      // Validate input
      if (enabled && (!intervalMinutes || intervalMinutes < 60)) {
        res.status(400).json({
          success: false,
          error: 'Sync interval must be at least 60 minutes'
        });
        return;
      }

      // Update sync schedule
      await this.syncScheduler.updateUserSchedule(userId, {
        enabled,
        intervalMinutes,
        services,
        types
      });

      res.json({
        success: true,
        message: 'Sync schedule updated',
        schedule: {
          enabled,
          intervalMinutes,
          services,
          types,
          nextSync: enabled ? this.syncScheduler.getNextSyncTime(userId) : null
        }
      });
    } catch (error: any) {
      logger.error('Sync schedule update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update sync schedule'
      });
    }
  }

  private async getSyncConflicts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      
      // This would fetch sync conflicts from the database
      // For now, return empty array
      res.json({
        success: true,
        conflicts: []
      });
    } catch (error: any) {
      logger.error('Sync conflicts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync conflicts'
      });
    }
  }

  private async resolveSyncConflict(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { resolution } = req.body;

      // This would resolve a specific sync conflict
      // Implementation depends on conflict resolution strategy
      res.json({
        success: true,
        message: 'Conflict resolved'
      });
    } catch (error: any) {
      logger.error('Sync conflict resolution error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve sync conflict'
      });
    }
  }

  private async getLastSyncForUser(userId: string) {
    const history = await this.database.getSyncHistory(userId, 1);
    return history.length > 0 ? history[0] : null;
  }
}
