# MyAnimePulse Tracker Integration for MAL-Sync

Adds [MyAnimePulse](https://myanimepulse.com) as an anime tracker in MAL-Sync, so
progress tracked on streaming sites syncs to a user's MyAnimePulse list. Entries
are keyed by MAL id, so they map directly to the id MAL-Sync already uses.

Anime only for now. MyAnimePulse also has manga lists, but manga sync is not
implemented yet.

## Auth

Token-based, no OAuth redirect. The user opens
`https://myanimepulse.com/auth/extension`, which shows a scoped `ap_` token and
also posts it to the page (`postMessage`, `{ type: 'myanimepulse-token' }`). The
content script (`src/index-webextension/myanimepulseOauth.ts`) captures it via the
shared handler (`src/_provider/AnimePulse/oauth.ts`) and stores it in the
`animepulseToken` setting. API calls send it as `Authorization: Bearer`.

## Provider (`src/_provider/AnimePulse/`)

- **helper.ts** — `apiCall()` (Bearer wrapper over `https://myanimepulse.com/api`,
  throws on non-2xx) and `translateList()` status mapping.
- **single.ts** — extends `SingleAbstract`. Parses `/anime/{malId}` URLs; reads via
  `GET /anime-list/{malId}` plus `GET /anime/{malId}` for metadata; writes via
  `POST /anime-list` (upsert — one endpoint for create and update); deletes via
  `DELETE /anime-list/{malId}`. Supports status, episode, score, start/finish
  dates, and rewatch count.
- **list.ts** — extends `ListAbstract`. `GET /anime-list?offset=&limit=50&status=`;
  `getUserObject()` via `GET /user/settings`; token through `accessToken()` /
  `deauth()`.
- **search.ts** — `GET /anime/filter?q={kw}&limit=10` for the correction UI.
- **metaOverview.ts** — `GET /api/anime/{id}` to populate the overview page.
- **oauth.ts** — shared token-capture handler.

## Integration points

- **src/provider/templates.ts** — provider entry, sync-mode value `MYANIMEPULSE`,
  shortName.
- **src/utils/syncHandler.ts** — myanimepulse.com URL detection, sync dispatch,
  rewatch-count check.
- **src/pages/pageInterface.ts**, **src/chibiScript/functions/core/coreFunctions.ts**
  — provider unions include `MYANIMEPULSE`.
- **src/index.ts** + **src/index-webextension/myanimepulseOauth.ts** — register the
  OAuth content script (userscript + webextension).
- **webpackConfig/httpPermissions.json** — `https://myanimepulse.com/` host
  permission.

## API endpoints used

All under `https://myanimepulse.com/api`, Bearer-authed:

| Method | Path | Purpose |
|---|---|---|
| GET | `/anime-list/{malId}` | single entry |
| POST | `/anime-list` | upsert (status, episodesWatched, rating, rewatchCount, startDate, finishDate) |
| DELETE | `/anime-list/{malId}` | remove entry |
| GET | `/anime-list?offset=&limit=&status=` | paged user list |
| GET | `/anime/{malId}` | anime metadata |
| GET | `/anime/filter?q=&limit=` | search |
| GET | `/user/settings` | username / avatar |

## Status mapping

| MyAnimePulse | MAL-Sync internal |
|---|---|
| WATCHING | status.Watching |
| COMPLETED | status.Completed |
| ON_HOLD | status.Onhold |
| DROPPED | status.Dropped |
| PLAN_TO_WATCH | status.PlanToWatch |

## Build

```bash
cd MALSync
npm install
npm run build:webextension
# load dist/webextension/ as an unpacked extension
```
