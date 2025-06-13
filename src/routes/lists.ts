import { Router, Request, Response } from 'express';
import { Database } from '../database/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class ListRoutes {
  public router: Router;
  private database: Database;

  constructor(database: Database) {
    this.router = Router();
    this.database = database;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/:service/:type', this.getList.bind(this));
    this.router.put('/entry/:id', this.updateEntry.bind(this));
    this.router.delete('/entry/:id', this.deleteEntry.bind(this));
    this.router.get('/compare', this.compareLists.bind(this));
  }

  private async getList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { service, type } = req.params;
      const { status } = req.query;

      // Validate parameters
      const validServices = ['mal', 'anilist', 'kitsu', 'simkl', 'shikimori'];
      const validTypes = ['anime', 'manga'];

      if (!validServices.includes(service)) {
        res.status(400).json({ error: 'Invalid service' });
        return;
      }

      if (!validTypes.includes(type)) {
        res.status(400).json({ error: 'Invalid type' });
        return;
      }

      // Get service token
      const token = await this.database.getServiceToken(userId, service as any);
      if (!token) {
        res.status(404).json({ error: 'Service not connected' });
        return;
      }

      // Get list from provider
      // This would be implemented with actual provider instances
      res.json({
        success: true,
        service,
        type,
        list: [], // Placeholder
        totalEntries: 0,
        lastUpdated: new Date()
      });
    } catch (error: any) {
      logger.error('Get list error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get list'
      });
    }
  }

  private async updateEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.body;

      // Validate and update entry
      // This would implement actual entry updates across services
      res.json({
        success: true,
        message: 'Entry updated',
        id,
        updates
      });
    } catch (error: any) {
      logger.error('Update entry error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update entry'
      });
    }
  }

  private async deleteEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // Delete entry from all connected services
      // This would implement actual entry deletion across services
      res.json({
        success: true,
        message: 'Entry deleted',
        id
      });
    } catch (error: any) {
      logger.error('Delete entry error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete entry'
      });
    }
  }

  private async compareLists(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { services, type } = req.query;

      // Compare lists across services
      // This would implement list comparison logic
      res.json({
        success: true,
        comparison: {
          services: services || [],
          type: type || 'anime',
          differences: [],
          totalEntries: {},
          lastCompared: new Date()
        }
      });
    } catch (error: any) {
      logger.error('Compare lists error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare lists'
      });
    }
  }
}
