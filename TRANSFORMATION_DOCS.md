# MALSync Transformation Documentation

## Project Overview
This document outlines the transformation of MALSync from a browser extension focused on anime streaming site integration to a headless Docker container dedicated to List Sync functionality.

## Current Architecture Analysis

### Browser Extension Structure
- **Manifest V3 extension** with background scripts, content scripts, and popup UI
- **Multi-provider sync system** supporting MAL, AniList, Simkl, Kitsu, and Shikimori
- **Streaming site integrations** for auto episode tracking (90+ supported sites)
- **Vue.js-based UI** in the _minimal directory for settings and management

### Core List Sync Components (TO KEEP)

#### Authentication Modules
- `/src/_provider/MyAnimeList_api/` - MAL OAuth2 implementation
- `/src/_provider/MyAnimeList_legacy/` - Legacy MAL authentication
- `/src/_provider/AniList/helper.ts` - AniList GraphQL authentication
- `/src/_provider/Kitsu/helper.ts` - Kitsu OAuth implementation
- `/src/_provider/Simkl/helper.ts` - Simkl OAuth implementation
- `/src/_provider/Shikimori/` - Shikimori OAuth implementation

#### Sync Logic
- `/src/utils/syncHandler.ts` - Core sync orchestration
- `/src/background/listSync.ts` - Background sync scheduling
- `/src/_provider/listFactory.ts` - Provider abstraction layer
- `/src/_provider/singleFactory.ts` - Individual entry sync
- `/src/_provider/listAbstract.ts` - Base list operations
- `/src/_provider/singleAbstract.ts` - Base entry operations

#### Provider Implementations
- Each provider has list.ts and single.ts for CRUD operations
- Helper files contain API communication logic
- OAuth modules handle authentication flows

#### UI Components (TO TRANSFORM)
- `/src/_minimal/` - Vue.js minimal app structure
- `/src/_minimal/views/` - Settings and sync management views
- `/src/_minimal/components/` - Reusable UI components

### Components to Remove

#### Streaming Site Integrations
- `/src/pages/` - All streaming site implementations (~90 sites)
- `/src/pages-adult/` - Adult content site implementations
- `/src/pages-chibi/` - Specific page interfaces (keep pageInterface.ts)
- Content script injection logic
- Video player enhancements
- Auto-tracking mechanisms

#### Browser-Specific Features
- `/src/background/notifications.ts` - Browser notifications
- `/src/background/customDomain.ts` - Custom domain handling
- `/src/floatbutton/` - Page overlay components
- Browser context menu items
- Content script messaging
- Browser storage APIs (replace with database)

#### Additional Features to Remove
- Discord integration
- Bookmark functionality
- Release progress tracking
- Firebase notifications
- Browser extension popup UI

## Transformation Plan

### Phase 1: Backup and Analysis
✅ Create timestamped backup of original project
✅ Analyze codebase structure and dependencies
✅ Document core List Sync functionality

### Phase 2: Infrastructure Setup
- [ ] Create new Docker-based project structure
- [ ] Set up Node.js/Express server foundation
- [ ] Implement database layer (SQLite initially, PostgreSQL option)
- [ ] Create RESTful API endpoints

### Phase 3: Authentication Migration
- [ ] Convert OAuth flows to server-side implementations
- [ ] Implement secure token storage in database
- [ ] Create authentication middleware
- [ ] Set up session management

### Phase 4: Sync Logic Migration
- [ ] Port sync handler logic to server environment
- [ ] Implement cron-based scheduling
- [ ] Create sync status tracking
- [ ] Add sync conflict resolution

### Phase 5: Frontend Development
- [ ] Extract and adapt Vue.js components
- [ ] Create web-based dashboard
- [ ] Implement real-time sync status updates
- [ ] Add service connection management UI

### Phase 6: Docker Configuration
- [ ] Create optimized Dockerfile
- [ ] Set up docker-compose for easy deployment
- [ ] Configure environment variables
- [ ] Implement health checks and logging

### Phase 7: Testing and Validation
- [ ] Test all 5 service integrations
- [ ] Validate sync functionality
- [ ] Performance testing
- [ ] Security assessment

## API Endpoints Design

### Authentication
- `POST /auth/mal/start` - Initiate MAL OAuth
- `POST /auth/mal/callback` - Handle MAL OAuth callback
- `POST /auth/anilist/start` - Initiate AniList OAuth
- `POST /auth/anilist/callback` - Handle AniList OAuth callback
- Similar endpoints for Kitsu, Simkl, Shikimori
- `DELETE /auth/:service` - Disconnect service
- `GET /auth/status` - Get connection status for all services

### Sync Management
- `POST /sync/manual` - Trigger manual sync
- `GET /sync/status` - Get current sync status
- `GET /sync/history` - Get sync history
- `PUT /sync/schedule` - Update sync schedule
- `GET /sync/conflicts` - Get sync conflicts

### List Operations
- `GET /lists/:service/:type` - Get anime/manga list
- `PUT /lists/entry/:id` - Update list entry
- `DELETE /lists/entry/:id` - Remove list entry

### System
- `GET /health` - Health check endpoint
- `GET /info` - System information

## Database Schema

### Users Table
- id (primary key)
- created_at
- updated_at

### Service_Tokens Table
- id (primary key)
- user_id (foreign key)
- service_name (mal, anilist, kitsu, simkl, shikimori)
- access_token (encrypted)
- refresh_token (encrypted)
- expires_at
- created_at
- updated_at

### Sync_History Table
- id (primary key)
- user_id (foreign key)
- sync_type (manual, scheduled)
- status (success, failure, partial)
- started_at
- completed_at
- details (JSON)

### Sync_Conflicts Table
- id (primary key)
- user_id (foreign key)
- mal_id
- service_name
- conflict_type
- data (JSON)
- resolved
- created_at

## Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///data/malsync.db
# or
DATABASE_URL=postgresql://user:pass@localhost:5432/malsync

# API Keys (user-provided)
MAL_CLIENT_ID=
MAL_CLIENT_SECRET=
ANILIST_CLIENT_ID=
ANILIST_CLIENT_SECRET=
KITSU_CLIENT_ID=
KITSU_CLIENT_SECRET=
SIMKL_CLIENT_ID=
SIMKL_CLIENT_SECRET=
SHIKIMORI_CLIENT_ID=
SHIKIMORI_CLIENT_SECRET=

# Server Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=
ENCRYPTION_KEY=

# Sync Configuration
SYNC_INTERVAL_MINUTES=1440  # 24 hours
MAX_RETRIES=3
```

## Docker Configuration

### Dockerfile
- Node.js 18+ base image
- Multi-stage build for optimization
- Non-root user for security
- Health check implementation

### docker-compose.yml
- Main application service
- Optional PostgreSQL service
- Volume mounts for data persistence
- Environment variable configuration

## Security Considerations

1. **Token Encryption**: All service tokens encrypted at rest
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **CORS Configuration**: Proper CORS policies for web interface
4. **Input Validation**: Comprehensive input validation and sanitization
5. **SSL/TLS**: HTTPS enforcement in production
6. **Session Security**: Secure session management with JWT
7. **Container Security**: Non-root user, minimal attack surface

## Deployment Instructions

1. **Prerequisites**: Docker and Docker Compose installed
2. **Configuration**: Copy and configure environment variables
3. **API Keys**: Obtain and configure service API keys
4. **Deployment**: Run `docker-compose up -d`
5. **Initial Setup**: Access web interface for service authentication
6. **Monitoring**: Check logs and health endpoints

## Migration Notes

- Users will need to re-authenticate with all services
- Existing sync schedules will be reset
- Browser extension data won't be automatically migrated
- Users should export their lists before migration if needed

## Testing Strategy

1. **Unit Tests**: Core sync logic and API endpoints
2. **Integration Tests**: Service authentication and sync operations
3. **End-to-End Tests**: Full sync workflow testing
4. **Performance Tests**: Sync performance with large lists
5. **Security Tests**: Authentication and authorization testing

## Future Enhancements

1. **Multi-user Support**: Support for multiple users
2. **Advanced Scheduling**: More flexible sync scheduling options
3. **Sync Rules**: Custom sync rules and filters
4. **Backup/Restore**: List backup and restore functionality
5. **Mobile App**: Native mobile application
6. **Webhook Support**: Webhook notifications for sync events
