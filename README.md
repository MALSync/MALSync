# MALSync Docker - List Sync Service

A headless Docker container version of MALSync focused exclusively on list synchronization across multiple anime/manga tracking platforms.

## Features

- **Multi-Platform Sync**: Synchronize your anime/manga lists across MyAnimeList, AniList, Kitsu, Simkl, and Shikimori
- **Scheduled Sync**: Automatic synchronization at configurable intervals
- **Manual Sync**: On-demand synchronization with real-time progress updates
- **Web Dashboard**: Modern web interface for managing connections and sync settings
- **Real-time Updates**: WebSocket-based live sync status updates
- **RESTful API**: Complete API for programmatic access
- **Docker Native**: Designed for containerized deployment with proper health checks

## Quick Start

### Prerequisites

- Docker and Docker Compose
- API credentials for the services you want to use (see [API Setup](#api-setup))

### 1. Clone and Setup

```bash
git clone <repository-url>
cd malsync-docker
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your API credentials:

```bash
# Required: Add your API credentials
MAL_CLIENT_ID=your_mal_client_id
MAL_CLIENT_SECRET=your_mal_client_secret
ANILIST_CLIENT_ID=your_anilist_client_id
# ... etc for other services

# Optional: Customize other settings
SYNC_INTERVAL_MINUTES=1440  # 24 hours
PORT=3000
```

### 3. Start the Service

```bash
# Using SQLite (default)
docker-compose up -d

# Using PostgreSQL
docker-compose --profile postgres up -d
```

### 4. Access the Dashboard

Open your browser and navigate to `http://localhost:3000`

1. Click "Get Started" to create a session
2. Connect your anime/manga tracking services
3. Configure sync settings
4. Start syncing!

## API Setup

You'll need to obtain API credentials from each service you want to use:

### MyAnimeList (MAL)
1. Go to [MAL API](https://myanimelist.net/apiconfig)
2. Create a new client
3. Set redirect URI to `http://localhost:3000/auth/mal/callback`
4. Copy Client ID and Client Secret

### AniList
1. Go to [AniList Developer](https://anilist.co/settings/developer)
2. Create a new client
3. Set redirect URI to `http://localhost:3000/auth/anilist/callback`
4. Copy Client ID and Client Secret

### Kitsu
1. Kitsu uses username/password authentication
2. No API credentials needed

### Simkl
1. Go to [Simkl API](https://simkl.com/settings/developer/)
2. Create a new application
3. Set redirect URI to `http://localhost:3000/auth/simkl/callback`
4. Copy Client ID and Client Secret

### Shikimori
1. Go to [Shikimori OAuth](https://shikimori.one/oauth/applications)
2. Create a new application
3. Set redirect URI to `http://localhost:3000/auth/shikimori/callback`
4. Copy Client ID and Client Secret

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `DATABASE_TYPE` | `sqlite` | Database type (`sqlite` or `postgresql`) |
| `DATABASE_URL` | `sqlite:///data/malsync.db` | Database connection string |
| `JWT_SECRET` | - | JWT signing secret (required) |
| `ENCRYPTION_KEY` | - | Key for encrypting tokens (required) |
| `SYNC_INTERVAL_MINUTES` | `1440` | Default sync interval |
| `CORS_ORIGIN` | `http://localhost:3000` | CORS allowed origin |
| `LOG_LEVEL` | `info` | Logging level |

### Database Options

#### SQLite (Default)
- No additional setup required
- Data stored in `./data/malsync.db`
- Good for single-user setups

#### PostgreSQL
- Better for multi-user deployments
- Use `docker-compose --profile postgres up -d`
- Configure `DATABASE_URL` for external PostgreSQL

### Sync Configuration

Sync behavior can be configured per-user through the web interface:

- **Manual Sync**: Trigger immediate synchronization
- **Scheduled Sync**: Configure automatic sync intervals (minimum 60 minutes)
- **Service Selection**: Choose which services to include in sync
- **Content Type**: Sync anime, manga, or both

## API Reference

### Authentication

#### Create Session
```http
POST /api/auth/session
```

#### Start OAuth Flow
```http
GET /api/auth/{service}/start
```

#### OAuth Callback
```http
POST /api/auth/{service}/callback
```

#### Disconnect Service
```http
DELETE /api/auth/{service}
Authorization: Bearer <token>
```

#### Get Auth Status
```http
GET /api/auth/status
Authorization: Bearer <token>
```

### Sync Management

#### Trigger Manual Sync
```http
POST /api/sync/manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "services": ["mal", "anilist"],
  "types": ["anime", "manga"]
}
```

#### Get Sync Status
```http
GET /api/sync/status
Authorization: Bearer <token>
```

#### Update Sync Schedule
```http
PUT /api/sync/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "intervalMinutes": 1440,
  "services": ["mal", "anilist"],
  "types": ["anime", "manga"]
}
```

#### Get Sync History
```http
GET /api/sync/history?limit=50
Authorization: Bearer <token>
```

### System

#### Health Check
```http
GET /api/system/health
```

#### System Info
```http
GET /api/system/info
```

## Real-time Updates

The web interface supports real-time sync progress updates via WebSocket:

```javascript
const socket = io();
socket.emit('join-sync-updates', userId);
socket.on('sync-status', (status) => {
  console.log('Sync update:', status);
});
```

## Data Storage

### SQLite Mode
- Database: `./data/malsync.db`
- Logs: `./logs/`

### PostgreSQL Mode
- Configure external PostgreSQL instance
- Set `DATABASE_URL` environment variable

### Data Backup

#### SQLite
```bash
# Backup
docker-compose exec malsync cp /app/data/malsync.db /app/data/backup.db

# Restore
docker-compose exec malsync cp /app/data/backup.db /app/data/malsync.db
```

#### PostgreSQL
Use standard PostgreSQL backup tools (`pg_dump`, `pg_restore`)

## Deployment

### Production Considerations

1. **Security**:
   - Use strong JWT_SECRET and ENCRYPTION_KEY
   - Configure proper CORS_ORIGIN
   - Use HTTPS in production
   - Regularly update dependencies

2. **Performance**:
   - Use PostgreSQL for better performance
   - Configure appropriate sync intervals
   - Monitor resource usage

3. **Monitoring**:
   - Check health endpoint: `/api/system/health`
   - Monitor logs for errors
   - Set up alerts for sync failures

### Docker Compose Production

```yaml
version: '3.8'
services:
  malsync:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/malsync
      - JWT_SECRET=your-production-secret
      - ENCRYPTION_KEY=your-production-key
    volumes:
      - malsync_logs:/app/logs
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=malsync
      - POSTGRES_USER=malsync
      - POSTGRES_PASSWORD=secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  malsync_logs:
  postgres_data:
```

### Kubernetes

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: malsync
spec:
  replicas: 1
  selector:
    matchLabels:
      app: malsync
  template:
    metadata:
      labels:
        app: malsync
    spec:
      containers:
      - name: malsync
        image: malsync:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: malsync-secrets
              key: database-url
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: malsync-data
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures
- Verify API credentials are correct
- Check redirect URIs match exactly
- Ensure services are properly configured

#### 2. Sync Errors
- Check service API status
- Verify rate limiting settings
- Review error logs for specific issues

#### 3. Database Issues
- Ensure proper permissions on data directory
- Check disk space availability
- Verify database connection string

#### 4. Network Issues
- Confirm outbound HTTPS access
- Check firewall settings
- Verify DNS resolution

### Logs

View logs in real-time:
```bash
# Container logs
docker-compose logs -f malsync

# Application logs (if file logging enabled)
docker-compose exec malsync tail -f /app/logs/app.log
```

### Debug Mode

Enable debug logging:
```bash
# Set in .env file
LOG_LEVEL=debug

# Or via environment variable
docker-compose run -e LOG_LEVEL=debug malsync
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials

# Start development server
npm run dev
```

### Building

```bash
# Build TypeScript
npm run build

# Build Docker image
docker build -t malsync:latest .
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

GPL-3.0-only - Same as original MALSync project

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check this README and API documentation
- Community: Join the MALSync Discord community

## Migration from Browser Extension

### Exporting Data

Before migrating, export your lists from the browser extension or directly from each service.

### Re-authentication

You'll need to re-authenticate with all services as tokens cannot be migrated.

### Sync Settings

Review and reconfigure your sync preferences in the new web interface.

## Changelog

### Version 1.0.0
- Initial Docker implementation
- Core sync functionality for 5 services
- Web-based dashboard
- RESTful API
- Real-time sync updates
- Scheduled sync support
