# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm ci` fails with an engine error | `engine-strict=true`; node < 24 or npm < 11 | Upgrade node/npm |
| `npm install` can't find a just-released version | `.npmrc` `min-release-age=2` | Wait, or pin an older version |
| `Cannot find module './ChibiGeneratorTypes'`, `chibiParamIndices` import error, or every `$c` chain has type errors | Generated typings missing or stale | `npm run build:chibiTypes` |
| `FUNCTIONS.md` missing | Same generator | `npm run build:chibiTypes` |
| `Cannot find module '…/quicklinks.json'` | Pre-build not run | `npm run build:webextension:content:build` |
| `'rm' is not recognized` on Windows | `build` uses `rm -rf` | `npm run build:win`, or use Git Bash/WSL |
| `SIMKL_API_ID, SIMKL_API_SECRET, MANGABAKA_API_ID and MANGABAKA_API_SECRET are not set` | `CI_MODE=travis` without keys | Unset `CI_MODE`, or provide all four |
| `[chibi] No content build found` | CLI needs `dist/webextension/chibi/list.json` | `npm run build:webextension:content` or start the content watcher |
| `[chibi] test/dist/chibiDev.js not found` | Missing test bundles | `npm run build:test` |
| Chibi Chrome closes immediately | Another chibi Chrome is using the profile | Close it, then rerun `npm run chibi` |
| Chrome DevTools MCP can't connect | CLI not running, or started with a non-default `--port` | Start `npm run chibi` on 9222 (matches `.mcp.json`) |
| Headless test result doesn't reflect your change | Stale cache in `test/dist/headless/clear/<title>/` or stale `test/dist/testCode.js` | Delete the cache folder; `test:headless` rebuilds the bundle |
| Puppeteer can't launch Chrome | Browser download skipped | `npx puppeteer browsers install chrome` |
| Installed extension logs `Unknown function: <name>` | Page JSON uses a function newer than the extension | Page needs `minimumVersion` (see `writing-chibi-integrations`) |
| `npm run dev:webextension:userscript` fails | References a missing `dev:webextension` script | Run `content`, `background` and `dev:userscript` separately |
| ESLint cspell "Unknown word" | Spell-check on code | Rename, or add a legitimate term to `cspell.json` |
