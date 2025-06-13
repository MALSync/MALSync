import { Router, Request, Response } from 'express';

export class SystemRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/health', this.healthCheck.bind(this));
    this.router.get('/info', this.getSystemInfo.bind(this));
  }

  private async healthCheck(req: Request, res: Response): Promise<void> {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    res.json(health);
  }

  private async getSystemInfo(req: Request, res: Response): Promise<void> {
    const info = {
      name: 'MALSync Docker',
      version: process.env.npm_package_version || '1.0.0',
      description: 'MALSync List Sync Service',
      environment: process.env.NODE_ENV || 'development',
      supportedServices: ['mal', 'anilist', 'kitsu', 'simkl', 'shikimori'],
      features: [
        'Cross-platform list synchronization',
        'Manual and scheduled sync',
        'Real-time sync status updates',
        'OAuth authentication',
        'Web-based management interface'
      ]
    };

    res.json(info);
  }
}
