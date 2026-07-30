import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.cache']);
const SKIP_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.map',
  '.zip',
  '.mp4',
  '.webm',
  '.lock',
  '.md',
]);
const SKIP_NAMES = new Set(['tests.json', 'list.json']);

// The only "correct format" this cares about: a quoted webextension match
// pattern ('*://...') or a plain http(s) URL ('https://...'). Group 2 is the
// domain, stripped of the leading wildcard subdomain.
const MATCH_PATTERN =
  /(['"])(?:\*|https?):\/\/(?:\*\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:\/[^'"]*)?\1/gi;

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (
      !SKIP_NAMES.has(entry.name) &&
      !entry.name.endsWith('test.ts') &&
      !SKIP_EXT.has(path.extname(entry.name))
    ) {
      out.push(full);
    }
  }
  return out;
}

// Only ENOTFOUND/ENODATA mean the domain truly doesn't exist. Other errors
// (timeouts, refused connections, ...) are inconclusive network hiccups —
// treating those as dead too would delete live domains on a bad network.
async function status(domain) {
  try {
    await dns.lookup(domain);
    return 'alive';
  } catch (e) {
    return e.code === 'ENOTFOUND' || e.code === 'ENODATA' ? 'dead' : 'unknown';
  }
}

async function main() {
  const write = !process.argv.includes('--dry');
  const files = listFiles(ROOT);
  const domainsByFile = new Map();
  const allDomains = new Set();

  for (const file of files) {
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // not readable as text, ignore
    }
    const found = [...text.matchAll(MATCH_PATTERN)].map(m => m[2].toLowerCase());
    if (found.length) {
      domainsByFile.set(file, new Set(found));
      found.forEach(d => allDomains.add(d));
    }
  }

  console.log(
    `Found ${allDomains.size} unique domains across ${domainsByFile.size} files. Checking DNS...`,
  );

  const dead = new Set();
  const unknown = new Set();
  const domains = [...allDomains];
  const BATCH = 20; // ponytail: fixed batch size, raise if DNS checks get slow
  for (let i = 0; i < domains.length; i += BATCH) {
    const batch = domains.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(status));
    batch.forEach((d, idx) => {
      if (results[idx] === 'dead') dead.add(d);
      else if (results[idx] === 'unknown') unknown.add(d);
    });
  }

  console.log(`${dead.size} domain(s) confirmed dead (NXDOMAIN):`);
  dead.forEach(d => console.log(`  - ${d}`));
  if (unknown.size) {
    console.log(`${unknown.size} domain(s) inconclusive (network error, not touched):`);
    unknown.forEach(d => console.log(`  - ${d}`));
  }

  if (!dead.size) return;

  if (!write) {
    console.log(
      '\nDry run only, nothing written. Re-run without --dry to strip these from the source files.',
    );
    return;
  }

  for (const [file, fileDomains] of domainsByFile) {
    const deadHere = [...fileDomains].filter(d => dead.has(d));
    if (!deadHere.length) continue;
    let text = fs.readFileSync(file, 'utf8');
    for (const domain of deadHere) {
      const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(
        `['"](?:\\*|https?):\\/\\/(?:\\*\\.)?${escaped}(?:\\/[^'"]*)?['"](\\s*,)?`,
        'gi',
      );
      text = text.replace(re, '');
    }
    fs.writeFileSync(file, text);
    console.log(`Updated ${path.relative(ROOT, file)}`);
  }
}

main();
