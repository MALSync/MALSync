import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dns from 'dns/promises';
import fs from 'fs';
import path from 'path';

// players
async function voe() {
  const response = await fetch('https://voe.sx/e/2sqxhth1ukzh');
  const body = await response.text();
  const loc = body.match(/window\.location\.href = '(.*)'/i);

  const url = new URL(loc[1]);

  addPlayerUrls('voe', [url.hostname + '/e/*']);
}

async function vidmoly() {
  const response = await fetch('https://vidmoly.me/embed-1abcdefghi1j.html', {
    redirect: 'manual',
  });
  const url = new URL(response.headers.get('Location'));

  addPlayerUrls('vidmoly', [url.hostname + '/*']);
}

async function mixdrop() {
  const response = await fetch('https://mdfx9dc8n.net/e/3nl0j0lec477v9', { redirect: 'manual' });
  const url = new URL(response.headers.get('Location'));

  addPlayerUrls('mixdrop', ['*.' + url.hostname + '/e/*']);
}

// pages

async function kickassanime() {
  const response = await fetch('https://watchanime.io');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('.domain-btn')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  let formattedUrls = [];
  for (let url of urls) {
    formattedUrls.push('*://*.' + url.hostname + '/*');
  }
  addPageUrls('KickAssAnime', formattedUrls);
}

async function miruro() {
  const response = await fetch('https://www.miruro.com/#domains');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('nav.domains a.domain')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  let formattedUrls = [];
  for (const url of urls) {
    const host = url.hostname.replace(/^www\./i, '');
    formattedUrls.push('*://*.' + host + '/*');
  }

  addChibiUrls('Miruro', [...new Set(formattedUrls)]);
}

async function anikoto() {
  const response = await fetch('https://anikoto.site/#domains');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('div.endpoint-row > div.endpoint-url > a')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  let formattedUrls = [];
  for (const url of urls) {
    formattedUrls.push('*://*.' + url.hostname + '/*');
  }

  addChibiUrls('AniKoto', [...new Set(formattedUrls)]);
}

async function mangapark() {
  const response = await fetch('https://mangaparkmirrors.pages.dev');
  const body = await response.text();

  const jsonMatch = body.match(/const domains = (\[.*?\]);/s);
  if (!jsonMatch) {
    throw new Error('No domains found');
  }

  const urls = [...jsonMatch[1].matchAll(/"https?:\/\/(.*?)"/g)].map(match => {
    return new URL(match[0].replace(/"/g, ''));
  });

  let formattedUrls = [];
  for (const url of urls) {
    formattedUrls.push('*://' + url.hostname + '/*');
  }
  addChibiUrls('MangaPark', formattedUrls);
}

function addPageUrls(page, urls) {
  logFoundUrls(page, urls, URL_TYPES.PAGE);

  let file = JSON.parse(fs.readFileSync(path.resolve(`./src/pages/${page}/meta.json`), 'utf8'));

  let addedCount = 0;
  const existingUrls = [];
  for (const url of urls) {
    if (!file.urls.match.includes(url)) {
      file.urls.match.push(url);
      addedCount++;
    } else {
      existingUrls.push(url);
    }
  }

  if (existingUrls.length > 0) {
    console.log(`[${page}] URLs already exist:\n ${existingUrls.join(',\n ')}`);
  }

  if (addedCount > 0) {
    fs.writeFileSync(
      path.resolve(`./src/pages/${page}/meta.json`),
      JSON.stringify(file, null, 2) + '\n',
    );
    console.log(`[${page}] Added ${addedCount} new URLs.`);
  } else {
    console.log(`[${page}] No new URLs added.`);
  }
}

function addChibiUrls(page, urls, mainName = 'main.ts') {
  logFoundUrls(page, urls, URL_TYPES.CHIBI);

  let file = fs.readFileSync(
    path.resolve(`src/pages-chibi/implementations/${page}/${mainName}`),
    'utf8',
  );

  const matchRegex = /match:\s*\[(.*?)\]/s;
  const matchMatch = file.match(matchRegex);
  if (!matchMatch) {
    throw new Error(`No match found in ${page} ${mainName}`);
  }

  const urlRegex = matchMatch[1].match(/'([^']+)'/g) || [];
  const matchUrls = urlRegex.map(url => url.replace(/'/g, ''));

  let addedCount = 0;
  const existingUrls = [];
  for (const url of urls) {
    if (!matchUrls.includes(url)) {
      matchUrls.push(url);
      addedCount++;
    } else {
      existingUrls.push(url);
    }
  }

  if (existingUrls.length > 0) {
    console.log(`[${page}] URLs already exist:\n ${existingUrls.join(',\n ')}`);
  }

  if (addedCount > 0) {
    const updatedFile = file.replace(
      matchRegex,
      `match: [${matchUrls.map(url => `'${url}'`).join(', ')}]`,
    );
    fs.writeFileSync(
      path.resolve(`src/pages-chibi/implementations/${page}/${mainName}`),
      updatedFile,
    );
    console.log(`[${page}] Added ${addedCount} new URLs.`);
  } else {
    console.log(`[${page}] No new URLs added.`);
  }
}

function addPlayerUrls(key, urls) {
  logFoundUrls(key, urls, URL_TYPES.PLAYER);

  let file = fs.readFileSync(path.resolve('./src/pages/playerUrls.js'), 'utf8');

  const comment = `      // auto-${key}-replace-dont-remove`;

  let data = '';
  let addedCount = 0;
  const existingUrls = [];
  for (const url of urls) {
    if (!file.includes(url)) {
      data += `      '*://${url}',\n`;
      addedCount++;
    } else {
      existingUrls.push(url);
    }
  }

  if (existingUrls.length > 0) {
    console.log(`[${key}] URLs already exist:\n ${existingUrls.join(',\n ')}`);
  }

  if (addedCount > 0) {
    data += comment;
    file = file.replace(comment, data);
    fs.writeFileSync(path.resolve('./src/pages/playerUrls.js'), file);
    console.log(`[${key}] Added ${addedCount} new URLs.`);
  } else {
    console.log(`[${key}] No new URLs added.`);
  }
}

const PRUNE_DNS_TIMEOUT = 5000;
const PRUNE_DNS_CONCURRENCY = 20;
// Above this share of dead hosts, assume the resolver is broken rather than the internet.
const PRUNE_ABORT_RATIO = 0.4;

/**
 * Extracts the resolvable hostname of a match pattern, or null when it cannot be
 * checked (leading `*.` is stripped, a bare `*` host is unverifiable).
 */
function patternHost(pattern) {
  const parsed = pattern.match(/^[^:]+:\/\/([^/]*)/);
  if (!parsed) return null;
  const host = parsed[1].replace(/^\*\./, '');
  return host && !host.includes('*') ? host : null;
}

/**
 * @returns {Promise<'alive' | 'dead' | 'unknown'>} `dead` only for a definitive NXDOMAIN.
 */
async function resolveHost(host) {
  const classify = async () => {
    for (const resolve of [h => dns.resolve4(h), h => dns.resolve6(h)]) {
      try {
        const addresses = await resolve(host);
        if (addresses.length) return 'alive';
      } catch (error) {
        // Anything other than "does not exist" is inconclusive, so keep the pattern.
        if (error.code !== 'ENOTFOUND' && error.code !== 'ENODATA') return 'unknown';
      }
    }
    return 'dead';
  };

  return Promise.race([
    classify(),
    new Promise(resolve => setTimeout(() => resolve('unknown'), PRUNE_DNS_TIMEOUT)),
  ]);
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Map();
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const item = items[cursor++];
        results.set(item, await worker(item));
      }
    }),
  );
  return results;
}

/**
 * Drops match patterns from playerUrls.js whose host no longer exists.
 *
 * `addPlayerUrls` only ever appends, so entries like `voe` or `gogostream` accumulate
 * domains forever; this is the missing counterpart. Deliberately conservative — a DNS
 * hiccup must never delete a working domain:
 *   - only a definitive NXDOMAIN removes a pattern (timeouts and errors are kept);
 *   - an entry is never emptied; if every host is dead it is reported, not touched,
 *     because that needs a human to find the replacement domain;
 *   - the run aborts when an implausible share of hosts looks dead.
 */
async function prunePlayerUrls({ dryRun = false } = {}) {
  const file = fs.readFileSync(path.resolve('./src/pages/playerUrls.js'), 'utf8');
  const eol = file.includes('\r\n') ? '\r\n' : '\n';
  const lines = file.split(/\r?\n/);

  // Map every line to the player entry it belongs to.
  const entryOfLine = [];
  let currentKey = null;
  lines.forEach((line, index) => {
    const opening = line.match(/^ {2}([A-Za-z0-9_]+):\s*\{/);
    if (opening) currentKey = opening[1];
    entryOfLine[index] = currentKey;
    if (/^ {2}\},/.test(line)) currentKey = null;
  });

  const occurrences = [];
  lines.forEach((line, index) => {
    const key = entryOfLine[index];
    if (!key) return;
    for (const quoted of line.matchAll(/'([^']+)'/g)) {
      const host = patternHost(quoted[1]);
      if (host) occurrences.push({ index, pattern: quoted[1], host, key });
    }
  });

  const hosts = [...new Set(occurrences.map(o => o.host))];
  const players = new Set(occurrences.map(o => o.key));
  console.log(`\n[prune] Resolving ${hosts.length} hosts across ${players.size} players...`);

  const status = await mapWithConcurrency(hosts, PRUNE_DNS_CONCURRENCY, resolveHost);
  const tally = { alive: 0, dead: 0, unknown: 0 };
  status.forEach(value => { tally[value]++; });
  console.log(
    `[prune] alive: ${tally.alive}, dead: ${tally.dead}, undetermined: ${tally.unknown}`,
  );

  if (hosts.length && tally.dead / hosts.length > PRUNE_ABORT_RATIO) {
    throw new Error(
      `${Math.round((tally.dead / hosts.length) * 100)}% of hosts look dead. ` +
        'Refusing to prune — check the network or the DNS resolver.',
    );
  }

  const perEntry = {};
  occurrences.forEach(o => {
    perEntry[o.key] = perEntry[o.key] || { total: 0, dead: [] };
    perEntry[o.key].total++;
    if (status.get(o.host) === 'dead') perEntry[o.key].dead.push(o);
  });

  const removals = new Map();
  const needsHuman = [];
  Object.entries(perEntry).forEach(([key, info]) => {
    if (!info.dead.length) return;
    if (info.dead.length === info.total) {
      needsHuman.push({ key, hosts: [...new Set(info.dead.map(o => o.host))] });
      return;
    }
    info.dead.forEach(o => {
      if (!removals.has(o.index)) removals.set(o.index, new Set());
      removals.get(o.index).add(o.pattern);
    });
  });

  const removed = [];
  const output = [];
  lines.forEach((line, index) => {
    const targets = removals.get(index);
    if (!targets) {
      output.push(line);
      return;
    }
    let updated = line;
    targets.forEach(pattern => {
      const literal = `'${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`;
      const before = updated;
      updated = updated.replace(new RegExp(`${literal},\\s*`), '');
      if (updated === before) updated = updated.replace(new RegExp(`,\\s*${literal}`), '');
      if (updated === before) updated = updated.replace(new RegExp(literal), '');
      removed.push(pattern);
    });
    // A line that only held removed patterns disappears entirely.
    if (!/^\s*$/.test(updated)) output.push(updated);
  });

  if (needsHuman.length) {
    console.log(`\n[prune] All hosts dead for ${needsHuman.length} player(s) — left untouched:`);
    needsHuman.forEach(e => console.log(`  ${e.key}: ${e.hosts.join(', ')}`));
    console.log('  A replacement domain has to be found before these can be removed.');
  }

  if (!removed.length) {
    console.log('\n[prune] Nothing to remove.');
    return;
  }

  const verb = dryRun ? 'Would remove' : 'Removed';
  console.log(`\n[prune] ${verb} ${removed.length} dead pattern(s):`);
  removed.forEach(pattern => console.log(`  ${pattern}`));

  if (dryRun) {
    console.log('\n[prune] Dry run — playerUrls.js left unchanged.');
    return;
  }

  fs.writeFileSync(path.resolve('./src/pages/playerUrls.js'), output.join(eol));
  console.log('\n[prune] playerUrls.js updated.');
}

const URL_TYPES = {
  PAGE: 'page',
  CHIBI: 'chibi',
  PLAYER: 'player',
};
/**
 * Logs the url(s) found in page, chibi or player.
 * @param {'page' | 'chibi' | 'player'} type - The type of url (sets log message)
 */
function logFoundUrls(key, urls, type = URL_TYPES.CHIBI) {
  switch (type) {
    case 'page':
      if (urls.length <= 0) {
        console.log(`\n[${key}] No Page found`);
      } else if (urls.length === 1) {
        console.log(`\n[${key}] Page found:\n`, urls[0]);
      } else if (urls.length > 1) {
        console.log(`\n[${key}] Pages found:\n`, urls.join(',\n '));
      }
      break;
    case 'chibi':
      if (urls.length <= 0) {
        console.log(`\n[${key}] No Chibi found`);
      } else if (urls.length === 1) {
        console.log(`\n[${key}] Chibi found:\n`, urls[0]);
      } else if (urls.length > 1) {
        console.log(`\n[${key}] Chibis found:\n`, urls.join(',\n '));
      }
      break;
    case 'player':
      if (urls.length <= 0) {
        console.log(`\n[${key}] No Player found`);
      } else if (urls.length === 1) {
        console.log(`\n[${key}] Player found:\n`, urls[0]);
      } else if (urls.length > 1) {
        console.log(`\n[${key}] Players found:\n`, urls.join(',\n'));
      }
      break;
    default:
      throw new Error('Invalid type provided.');
  }
}

async function start() {
  const args = process.argv.slice(2);
  const tasks = {
    voe,
    vidmoly,
    mixdrop,
    kickassanime,
    miruro,
    mangapark,
    anikoto,
  };

  // Lists all jobs to launch in parallel used in autoUrls.yml
  if (args.includes('--list')) {
    console.log(JSON.stringify(Object.keys(tasks)));
    return;
  }

  // Counterpart of the scraping tasks: removes player domains that no longer exist.
  // Kept out of `tasks` on purpose, it is not a per-site job.
  if (args.includes('--prune')) {
    await prunePlayerUrls({ dryRun: args.includes('--dry-run') });
    console.log('\nAutoUrls — Done.');
    return;
  }

  const specificTask = args[0];
  const failedTasks = [];
  const succeededTasks = [];

  let tasksToRun = tasks;
  if (specificTask) {
    if (tasks[specificTask]) {
      tasksToRun = { [specificTask]: tasks[specificTask] };
    } else {
      console.error(`Task "${specificTask}" not found.`);
      process.exitCode = 1;
    }
  }

  for (const key of Object.keys(tasksToRun)) {
    await tasksToRun[key]()
      .then(() => succeededTasks.push(key))
      .catch(e => {
        console.error(`\n[${key}]:`, e);
        failedTasks.push(key);
        if (process.env.GITHUB_ACTIONS) {
          console.log(`::error title=Task [${key}] Failed::${e.message || e}`);
        }
      });
  }

  if (succeededTasks.length) {
    if (args) {
      console.log('\n\x1b[32mTask succeeded:\x1b[0m', succeededTasks.join(', '));
    } else {
      console.log('\n\n\x1b[32mTasks succeeded:\x1b[0m', succeededTasks.join(', '));
    }
  }
  if (failedTasks.length) {
    if (args) {
      console.log('\n\x1b[31mTask failed:\x1b[0m', failedTasks.join(', '));
    } else {
      console.log('\x1b[31mTasks failed:\x1b[0m', failedTasks.join(', '));
    }
    process.exitCode = 1;
  }

  console.log('\nAutoUrls — Done.');
}

start();
