# AnimePulse Tracker Integration for MAL-Sync

## Overview
Add AnimePulse as a tracker option in MAL-Sync so users can auto-track episodes on streaming sites.

## Files to Create

### 1. `src/_provider/AnimePulse/helper.ts`
- `translateList()` — map AnimePulse statuses (WATCHING, COMPLETED, etc.) to MAL-Sync internal statuses
- `apiCall()` — wrapper for AnimePulse API calls with auth token
- `getCacheKey()` — return unique cache key for entries
- Auth URL: `https://myanimepulse.com/auth/login?extension=true&callback=...`
- Base API URL: `https://myanimepulse.com/api`

### 2. `src/_provider/AnimePulse/single.ts`
Extends `SingleAbstract`. Handles individual anime entries.

**Key methods:**
- `handleUrl()` — parse AnimePulse URLs (`/anime/{malId}`)
- `_getStatus()` / `_setStatus()` — map to WATCHING/COMPLETED/etc.
- `_getEpisode()` / `_setEpisode()` — episode progress
- `_getScore()` / `_setScore()` — rating (1-10)
- `_update()` — GET `/api/anime-list/{animeId}` 
- `_sync()` — PATCH `/api/anime-list/{animeId}`
- `_delete()` — DELETE `/api/anime-list/{animeId}`

### 3. `src/_provider/AnimePulse/list.ts`
Extends `ListAbstract`. Fetches the user's anime list.

**Key methods:**
- `getPart()` — GET `/api/anime-list` with status filter
- `getUserObject()` — GET `/api/user/settings` for username/avatar
- `deauth()` — clear stored token
- `accessToken()` — return stored `animepulseToken`

### 4. `src/_provider/AnimePulse/search.ts`
Search for anime on AnimePulse.

- GET `/api/anime/filter?q={keyword}&limit=10`
- Return results mapped to MAL-Sync's search interface

## Files to Modify

### `src/_provider/helper.ts`
Add to `providers` object:
```ts
ANIMEPULSE: { title: 'AnimePulse', value: 'ANIMEPULSE', anime: true, manga: false, short: true },
```

### `src/_provider/singleAbstract.ts`
Add `pulse: NaN` to the `ids` object.

### `src/_provider/singleFactory.ts`
Add AnimePulse case to `getSingle()`.

### `src/_provider/listFactory.ts`
Add AnimePulse case to `getListObj()`.

### `src/api/settings.ts`
Add `animepulseToken: ''` to settings.

## AnimePulse API Requirements

The extension needs these AnimePulse API endpoints (most already exist):

1. **Auth** — Need to add OAuth/token endpoint for extensions
   - `POST /api/auth/extension-token` — generate a long-lived API token
   - Settings page shows "Extension Token" with copy button

2. **Get anime list entry** — `GET /api/anime-list?animeId={id}` (exists)
3. **Update entry** — `PATCH /api/anime-list/{animeId}` (exists)
4. **Add to list** — `POST /api/anime-list` (exists)
5. **Delete entry** — `DELETE /api/anime-list/{animeId}` (exists)
6. **Search** — `GET /api/anime/filter?q={query}` (exists)
7. **User info** — `GET /api/user/settings` (exists)

## Status Mapping

| AnimePulse | MAL-Sync Internal |
|---|---|
| WATCHING | status.Watching |
| COMPLETED | status.Completed |
| ON_HOLD | status.Onhold |
| DROPPED | status.Dropped |
| PLAN_TO_WATCH | status.PlanToWatch |

## Build & Test

```bash
cd MALSync
npm install
npm run build
# Load dist/webextension/ as unpacked extension in Chrome
```

## Priority Order
1. Create helper.ts with API calls + status mapping
2. Create single.ts with entry CRUD
3. Create list.ts with user list fetching  
4. Register in factory files
5. Add extension token API to AnimePulse
6. Test with Chrome unpacked extension
