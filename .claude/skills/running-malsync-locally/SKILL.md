---
name: running-malsync-locally
description: Sets up, builds, runs and tests the MAL-Sync browser extension and userscript locally. Use when installing dependencies, building for Chrome, Firefox or the userscript, running watch mode or the chibi dev browser (`npm run chibi`), loading the unpacked extension, running unit or headless page tests, reproducing CI lint/test/page jobs, or troubleshooting local build errors (engine version, missing ChibiGeneratorTypes.ts/FUNCTIONS.md/quicklinks.json, Windows build issues, puppeteer, API keys) in this repository.
---

# Running MAL-Sync locally

The root `AGENTS.md` lists the core commands. `src/pages-chibi/AGENTS.md` describes the chibi browser workflow. This skill adds the full picture: what each script does, outputs, CI parity and fixes for common failures.

## Rules that apply to every task

1. Use node >= 24 and npm >= 11 (`engine-strict=true` in `.npmrc`).
2. On Windows use `npm run build:win`; `build` calls `rm -rf`.
3. Generate the gitignored sources before type-checking, linting or testing: `npm run build:chibiTypes` (`ChibiGeneratorTypes.ts`, `FUNCTIONS.md`) and `npm run build:webextension:content:build` (`quicklinks.json`).
4. Headless page tests and the chibi CLI use bundles from `npm run build:test`. The chibi CLI also needs a content build in `dist/`.
5. Don't commit generated lists (README page table, `pages.md`, `src/pages-adult/README.md`, `src/pages/list.json`).
6. Before declaring work done, match CI with `npm run lint:ci` and `npm run test:ts:ci`, plus the page test for any touched integration.

## Task router

Read **every** file listed for your task. Paths are relative to this skill's directory.

| Task | Read |
|---|---|
| First-time setup / full build / load the extension | `workflows/first-time-setup.md`, `reference/build-outputs.md` |
| Develop with live rebuilds, chibi dev browser | `workflows/dev-loop.md`, `reference/build-outputs.md` |
| Run tests (unit or page) | `reference/testing.md` |
| Prepare a PR / reproduce a CI job | `workflows/ci-parity.md`, `reference/testing.md` |
| Look up an npm script | `reference/commands.md` |
| Something fails locally | `reference/troubleshooting.md`, `reference/build-outputs.md` |

For writing or fixing site integrations, also use the `writing-chibi-integrations` skill.

## File map

- `workflows/first-time-setup.md`: install, first build, loading in Chrome/Firefox, userscript.
- `workflows/dev-loop.md`: watchers, the chibi CLI, what to rebuild after which change.
- `workflows/ci-parity.md`: what each GitHub Actions job runs and how to reproduce it.
- `reference/commands.md`: every npm script, grouped.
- `reference/build-outputs.md`: `dist/` and `test/dist/` layout, generated files, environment variables.
- `reference/testing.md`: unit tests and headless page tests, single-test commands.
- `reference/troubleshooting.md`: known failures and fixes.
