# Testing

## Unit tests (mocha + chai via ts-mocha)

Location: `test/src/**/*.test.ts` (chibiScript engine and functions, providers, utils, background, minimal list sync). `test/_env_injection.ts` injects the build-time keys.

```bash
npm run test:ts                     # all
npm run test:ts:ci                  # all, NO_API=true (no live tracker APIs)
npx ts-mocha -p tsconfig.node.json test/src/utils/slug.test.ts --require test/_env_injection.ts               # one file
npx ts-mocha -p tsconfig.node.json test/src/utils/slug.test.ts --require test/_env_injection.ts -g "pattern"  # filter by name
```

Prerequisites: `npm run build:chibiTypes` and `npm run build:webextension:content:build`. Provider tests under `test/src/provider/` call live APIs unless `NO_API=true`.

## Headless page tests (puppeteer)

```bash
CI=true npm run test:headless "<tests.json title>"   # one page, headless
npm run test:headless "<tests.json title>"           # one page, visible browser (debugging)
npm run test:headless                                # every page (slow)
```

- `test:headless` runs `build:test` first, so chibi pages are compiled from source into `test/dist/testCode.js`. No `dist/webextension` build is needed.
- The runner finds every `tests.json` under `src/`.
- The first run per page fetches the live site and caches it in `test/dist/headless/clear/<title>/`. Later runs replay that cache, so delete the folder to test against the current site.
- Failures can come from the site (Cloudflare, captcha, geo-blocking, outages). The runner retries Cloudflare challenges up to 3 times; per AGENTS.md, a page test that can't pass for such reasons is committed anyway, with a note.
- The comparison rules for each `expected` field are in `.claude/skills/writing-chibi-integrations/reference/headless-tests.md`.
- Puppeteer needs its Chrome download. If install skipped it, run `npx puppeteer browsers install chrome`.
