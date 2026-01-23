import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
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

async function zoro() {
  const response = await fetch('https://hianime.tv');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('ul.site-opt > li > a')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  let formattedUrls = [];
  for (const url of urls) {
    formattedUrls.push('*://' + url.hostname + '/*');
  }
  addPageUrls('Zoro', formattedUrls);
}

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

async function animekai() {
  const response = await fetch('https://animekai.ws/');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('.site-lists li > a')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  let formattedUrls = [];
  for (const url of urls) {
    formattedUrls.push('*://' + url.hostname + '/*');
  }
  addChibiUrls('AnimeKAI', formattedUrls);
}

async function bato() {
  const response = await fetch('https://batotomirrors.pages.dev');
  const body = await response.text();
  const $ = cheerio.load(body);

  // Bato url gave JS to list their bato endpoint when fetch() it.
  const urlJS = $('script')
    .map((i, el) => $(el).html())
    .get()
    .find(text => text.includes('const domains'));

  const ExtractUrl = [...urlJS.matchAll(/url:\s*"(.*?)"/g)];
  const urls = ExtractUrl.map(m => new URL(m[1]));

  let formattedUrls = [];
  for (const url of urls) {
    formattedUrls.push('*://' + url.hostname + '/*');
  }
  addChibiUrls('bato', formattedUrls, 'mainV2.ts');
  addChibiUrls('bato', formattedUrls, 'mainV3.ts');
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
    zoro,
    kickassanime,
    animekai,
    bato,
    mangapark,
  };

  // Lists all jobs to launch in parallel used in autoUrls.yml
  if (args.includes('--list')) {
    console.log(JSON.stringify(Object.keys(tasks)));
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
    if (!process.env.GITHUB_ACTIONS) {
      process.exitCode = 1;
    }
  }

  console.log('\nAutoUrls — Done.');
}

start();
