# Workflow: reproduce CI before pushing

All workflows use node 24 and `npm ci`. `.github/workflows/tests.yml` runs on every push and PR. `pages.yml` runs page tests for changed integrations.

```
- [ ] 1. Lint job
- [ ] 2. Unit test job
- [ ] 3. Build job
- [ ] 4. Page tests for touched integrations
```

## 1. Lint (tests.yml → lint)

```bash
npm run build:chibiTypes
npm run lint:ci          # stylelint -q + eslint --quiet + vue-tsc --noEmit
```
`npm run lint:fix` autofixes. ESLint (flat config in `config/eslint/`) includes prettier, cspell spell-checking, `no-unsanitized`, `es-x` and the custom `jquery-unsafe-malsync` rules. For a cspell "Unknown word", rename it, or add a legitimate term (site name, etc.) to `cspell.json`.

## 2. Unit tests (tests.yml → tests)

```bash
npm run build:webextension:assets
npm run build:chibiTypes
npm run build:webextension:content:build
npm run test:ts:ci       # NO_API=true: skips tests that call real tracker APIs
```
CI runs the build steps with `CI_MODE=travis` and placeholder Simkl/MangaBaka keys. Locally the built-in keys are used, so leave `CI_MODE` unset.

## 3. Build (tests.yml → build)

```bash
npm run build            # Windows: npm run build:win
```

## 4. Page tests (pages.yml)

CI builds the extension and the test bundle, then lists the pages whose files changed (`LIST_PAGES=true` + `FILES`). It runs each listed page in its own job with `CI=true` against the cached site data from `MALSync/test_data`. To reproduce one page locally:
```bash
CI=true npm run test:headless "<tests.json title>"
```
The first local run fetches the live site and caches it (`reference/testing.md`).
