#!/usr/bin/env node
/*
 * Starts a Chrome for developing chibi pages. See src/pages-chibi/AGENTS.md.
 *
 * The Chrome has a small dev extension that provides window.ChibiDev (test/chibiDev/runtime.ts)
 * with the current content build (dist/webextension/chibi) on every page. The data is kept in sync
 * while this process runs. Agents control the browser through the Chrome DevTools MCP on the debugging port.
 *
 * Usage: npm run chibi -- [url] [--port 9222]
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const root = path.join(__dirname, '../..');
const outDir = path.join(root, 'test/dist/chibi-dev');
const extensionDir = path.join(outDir, 'extension');
const profileDir = path.join(outDir, 'profile');
const runtimePath = path.join(root, 'test/dist/chibiDev.js');
const chibiRoots = [
  path.join(root, 'dist/webextension/chibi'),
  path.join(root, 'dist/adult/chibi'),
];

function log(...text) {
  console.log('[chibi]', ...text);
}

function fail(message) {
  console.error('[chibi]', message);
  process.exit(1);
}

function parseArgs(argv) {
  const options = { port: 9222, url: 'about:blank' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') options.port = Number(argv[++i]);
    else options.url = argv[i];
  }
  return options;
}

function mtime(file) {
  return fs.existsSync(file) ? fs.statSync(file).mtimeMs : 0;
}

// Same format as the chibi repositories: { list: list.json, pages: { [key]: pages/<key>.json } }
function readBuild() {
  const data = { list: { pages: {} }, pages: {} };
  chibiRoots.forEach(dir => {
    const file = path.join(dir, 'list.json');
    if (!fs.existsSync(file)) return;
    const list = JSON.parse(fs.readFileSync(file, 'utf8'));
    Object.keys(list.pages).forEach(key => {
      data.list.pages[key] = list.pages[key];
      data.pages[key] = JSON.parse(fs.readFileSync(path.join(dir, 'pages', `${key}.json`), 'utf8'));
    });
  });
  return data;
}

function syncData() {
  const data = readBuild();
  fs.writeFileSync(path.join(extensionDir, 'data.json'), JSON.stringify(data));
  log(`Synced ${Object.keys(data.pages).length} pages from the build`);
  return data;
}

function buildExtension() {
  fs.mkdirSync(extensionDir, { recursive: true });
  const copy = (from, to) => fs.copyFileSync(from, path.join(extensionDir, to));
  copy(path.join(root, 'node_modules/jquery/dist/jquery.min.js'), 'jquery.js');
  copy(path.join(root, 'test/headless/chromeStub.js'), 'chromeStub.js');
  copy(runtimePath, 'chibiDev.js');
  copy(path.join(root, 'test/dist/chibiDevProxy.js'), 'chibiDevProxy.js');
  copy(path.join(__dirname, 'extension/bridge.js'), 'bridge.js');

  const data = syncData();

  // Pages with requestProxy need the proxy before the site loads
  const proxyMatches = [];
  Object.values(data.list.pages).forEach(page => {
    if (page.features && page.features.requestProxy) proxyMatches.push(...page.urls.match);
  });

  const manifest = {
    manifest_version: 3,
    name: 'MAL-Sync Chibi Dev',
    version: '1.0.0',
    description: 'Provides window.ChibiDev for developing chibi pages',
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['jquery.js', 'chromeStub.js', 'chibiDev.js'],
        run_at: 'document_start',
        world: 'MAIN',
      },
      {
        matches: ['<all_urls>'],
        js: ['bridge.js'],
        run_at: 'document_start',
      },
      ...(proxyMatches.length
        ? [{ matches: proxyMatches, js: ['chibiDevProxy.js'], run_at: 'document_start', world: 'MAIN' }]
        : []),
    ],
    web_accessible_resources: [{ resources: ['data.json'], matches: ['<all_urls>'] }],
  };
  fs.writeFileSync(path.join(extensionDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

// Content scripts are cached when the extension loads, data.json is read on every page load
function watchBuild() {
  const listFiles = chibiRoots.map(dir => path.join(dir, 'list.json'));
  let lastBuild = Math.max(...listFiles.map(mtime));
  let lastRuntime = mtime(runtimePath);
  setInterval(() => {
    const build = Math.max(...listFiles.map(mtime));
    if (build !== lastBuild) {
      lastBuild = build;
      // The content build writes several files, give it a moment
      setTimeout(syncData, 500);
    }
    const runtime = mtime(runtimePath);
    if (runtime !== lastRuntime) {
      lastRuntime = runtime;
      log('test/dist/chibiDev.js changed. Restart `npm run chibi` to load the new runtime');
    }
  }, 1000);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(path.join(chibiRoots[0], 'list.json'))) {
    fail('No content build found. Run `npm run build:webextension:content` or `npm run dev:webextension:content` first.');
  }
  if (!fs.existsSync(runtimePath)) {
    fail('test/dist/chibiDev.js not found. Run `npm run build:test` first.');
  }

  buildExtension();
  fs.mkdirSync(profileDir, { recursive: true });

  const chrome = spawn(
    await puppeteer.executablePath(),
    [
      `--remote-debugging-port=${options.port}`,
      // Remote debugging needs a separate profile. It is kept, so logins and captchas persist.
      `--user-data-dir=${profileDir}`,
      `--load-extension=${extensionDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      options.url,
    ],
    { stdio: 'ignore' },
  );
  const started = Date.now();
  chrome.on('exit', () => {
    if (Date.now() - started < 5000) {
      fail('Chrome exited right away. Is a chibi Chrome already running? Close it first.');
    }
    log('Chrome closed');
    process.exit(0);
  });

  watchBuild();
  log(`Chrome is running with the debugging port http://127.0.0.1:${options.port}`);
  log('Keep `npm run dev:webextension:content` running, page changes are picked up on reload');
}

main().catch(error => fail(error.stack || error));
