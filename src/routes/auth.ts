import { Router, Request, Response } from 'express';
import { Database } from '../database/database';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export class AuthRoutes {
  public router: Router;
  private database: Database;

  constructor(database: Database) {
    this.router = Router();
    this.database = database;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Create or get user session
    this.router.post('/session', this.createSession.bind(this));
    
    // OAuth initiation endpoints
    this.router.get('/mal/start', this.startMalAuth.bind(this));
    this.router.get('/anilist/start', this.startAnilistAuth.bind(this));
    this.router.get('/kitsu/start', this.startKitsuAuth.bind(this));
    this.router.get('/simkl/start', this.startSimklAuth.bind(this));
    this.router.get('/shikimori/start', this.startShikimoriAuth.bind(this));

    // OAuth callback endpoints
    this.router.post('/mal/callback', this.handleMalCallback.bind(this));
    this.router.post('/anilist/callback', this.handleAnilistCallback.bind(this));
    this.router.post('/kitsu/callback', this.handleKitsuCallback.bind(this));
    this.router.post('/simkl/callback', this.handleSimklCallback.bind(this));
    this.router.post('/shikimori/callback', this.handleShikimoriCallback.bind(this));

    // Disconnect service
    this.router.delete('/:service', this.disconnectService.bind(this));

    // Get authentication status
    this.router.get('/status', this.getAuthStatus.bind(this));
  }

  private generateUserId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateJWT(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    return jwt.sign({ userId }, jwtSecret, { expiresIn: '30d' });
  }

  private async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.generateUserId();
      
      // Create user in database
      await this.database.createUser(userId);
      
      // Generate JWT token
      const token = this.generateJWT(userId);
      
      res.json({
        success: true,
        userId,
        token
      });
    } catch (error: any) {
      logger.error('Session creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create session'
      });
    }
  }

  private async startMalAuth(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.MAL_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'MAL client ID not configured' });
        return;
      }

      const challenge = crypto.randomBytes(32).toString('base64url');
      const state = crypto.randomBytes(16).toString('hex');
      
      // Store challenge in session/cache (simplified here)
      const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&state=${state}&code_challenge=${challenge}&code_challenge_method=plain`;
      
      res.json({
        authUrl,
        state,
        challenge
      });
    } catch (error: any) {
      logger.error('MAL auth start error:', error);
      res.status(500).json({ error: 'Failed to start MAL authentication' });
    }
  }

  private async startAnilistAuth(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.ANILIST_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'AniList client ID not configured' });
        return;
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/auth/anilist/callback`;
      const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      res.json({ authUrl });
    } catch (error: any) {
      logger.error('AniList auth start error:', error);
      res.status(500).json({ error: 'Failed to start AniList authentication' });
    }
  }

  private async startKitsuAuth(req: Request, res: Response): Promise<void> {
    // Kitsu uses username/password authentication
    res.json({ 
      message: 'Kitsu uses username/password authentication',
      loginUrl: '/auth/kitsu/login'
    });
  }

  private async startSimklAuth(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.SIMKL_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'Simkl client ID not configured' });
        return;
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/auth/simkl/callback`;
      const authUrl = `https://simkl.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      res.json({ authUrl });
    } catch (error: any) {
      logger.error('Simkl auth start error:', error);
      res.status(500).json({ error: 'Failed to start Simkl authentication' });
    }
  }

  private async startShikimoriAuth(req: Request, res: Response): Promise<void> {
    try {
      const clientId = process.env.SHIKIMORI_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'Shikimori client ID not configured' });
        return;
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/auth/shikimori/callback`;
      const authUrl = `https://shikimori.one/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user_rates`;
      
      res.json({ authUrl });
    } catch (error: any) {
      logger.error('Shikimori auth start error:', error);
      res.status(500).json({ error: 'Failed to start Shikimori authentication' });
    }
  }

  private async handleMalCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, challenge, userId } = req.body;
      
      if (!code || !userId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      // Exchange code for token
      const clientId = process.env.MAL_CLIENT_ID;
      const tokenResponse = await fetch('https://myanimelist.net/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${clientId}&grant_type=authorization_code&code=${code}&code_verifier=${challenge}`,
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        await this.database.createServiceToken({
          user_id: userId,
          service_name: 'mal',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
        });

        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Failed to get access token' });
      }
    } catch (error: any) {
      logger.error('MAL callback error:', error);
      res.status(500).json({ error: 'Failed to complete MAL authentication' });
    }
  }

  private async handleAnilistCallback(req: Request, res: Response): Promise<void> {
    try {
      const { access_token, userId } = req.body;
      
      if (!access_token || !userId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      await this.database.createServiceToken({
        user_id: userId,
        service_name: 'anilist',
        access_token: access_token,
      });

      res.json({ success: true });
    } catch (error: any) {
      logger.error('AniList callback error:', error);
      res.status(500).json({ error: 'Failed to complete AniList authentication' });
    }
  }

  private async handleKitsuCallback(req: Request, res: Response): Promise<void> {
    // Handle Kitsu authentication (username/password)
    res.status(501).json({ error: 'Kitsu authentication not yet implemented' });
  }

  private async handleSimklCallback(req: Request, res: Response): Promise<void> {
    // Handle Simkl OAuth callback
    res.status(501).json({ error: 'Simkl authentication not yet implemented' });
  }

  private async handleShikimoriCallback(req: Request, res: Response): Promise<void> {
    // Handle Shikimori OAuth callback
    res.status(501).json({ error: 'Shikimori authentication not yet implemented' });
  }

  private async disconnectService(req: Request, res: Response): Promise<void> {
    try {
      const { service } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      await this.database.deleteServiceToken(userId, service as any);
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Service disconnect error:', error);
      res.status(500).json({ error: 'Failed to disconnect service' });
    }
  }

  private async getAuthStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const tokens = await this.database.getUserServiceTokens(userId);
      const status: Record<string, boolean> = {
        mal: false,
        anilist: false,
        kitsu: false,
        simkl: false,
        shikimori: false,
      };

      tokens.forEach(token => {
        status[token.service_name] = true;
      });

      res.json({ status });
    } catch (error: any) {
      logger.error('Auth status error:', error);
      res.status(500).json({ error: 'Failed to get authentication status' });
    }
  }
}
