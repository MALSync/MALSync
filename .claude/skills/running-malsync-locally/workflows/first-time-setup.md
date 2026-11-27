# Workflow: first-time setup and full build

```
- [ ] 1. Check node >= 24 and npm >= 11
- [ ] 2. npm ci
- [ ] 3. Build
- [ ] 4. Load the extension (Chrome or Firefox) or install the userscript
```

## 1–2. Install

```bash
node -v && npm -v
npm ci               # lockfile-exact install, same as CI
```
- `.npmrc` sets `engine-strict=true` (older node/npm fail the install) and `min-release-age=2` (npm only installs package versions released at least 2 days ago).
- Puppeteer downloads Chrome during install. It's needed for headless page tests and `npm run chibi`, so only skip it (`PUPPETEER_SKIP_DOWNLOAD=true`) on machines that won't run them.

## 3. Build

| Goal | Command |
|---|---|
| Everything (Linux/macOS) | `npm run build` |
| Everything (Windows) | `npm run build:win` |
| Extension (Chromium) | `npm run build:webextension` |
| Extension (Firefox) | `npm run build:webextension:firefox`. Only for Firefox; don't use it for Chromium testing |
| Userscript | `npm run build:userscript` (needs the content build first; see `reference/build-outputs.md`) |
| Test/dev bundles | `npm run build:test` (headless tests, chibi CLI) |

`build` = clean + `build:webextension` (content, background, assets) + `build:userscript`.

## 4a. Chrome / Chromium

`chrome://extensions` → enable **Developer mode** → **Load unpacked** → select `dist/webextension`. After rebuilding, reload the extension card, then the site tab.

## 4b. Firefox

Build with `npm run build:webextension:firefox`. Open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `dist/webextension/manifest.json`. Temporary add-ons are removed when Firefox restarts.

## 4c. Userscript

Install `dist/malsync.user.js` in a userscript manager (Tampermonkey, Violentmonkey). It loads chibi pages from the remote repositories (`…/config` and `…/adult`).

Next: `workflows/dev-loop.md`.
