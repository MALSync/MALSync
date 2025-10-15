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

  for (const url of urls) {
    addpageUrls('Zoro', ['*://' + url.hostname + '/*']);
  }
}

async function kickassanime() {
  const response = await fetch('https://watchanime.io');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('.domain-btn')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  for (let url of urls) {
    addpageUrls('KickAssAnime', ['*://*.' + url.hostname + '/*']);
  }
}

async function animekai() {
  const response = await fetch('https://animekai.me/');
  const body = await response.text();

  const $ = cheerio.load(body);

  const urls = $('.site-lists li > a')
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  for (const url of urls) {
    addChibiUrls('AnimeKAI', ['*://' + url.hostname + '/*']);
  }
}

async function bato() {
  let response = await fetch('https://rentry.co/batoto');
  if (!response.ok) {
    response = await fetch('https://rentry.org/batoto');
  }
  const body = await response.text();

  const $ = cheerio.load(body);
  //remove links that are still in development (removes everything after .warning class and itself)
  $('.warning').nextAll().remove().end().remove();

  const urls = $('.external') // all links have "external" class
    .map((i, el) => new URL($(el).attr('href')))
    .get();

  for (const url of urls) {
    addChibiUrls('bato', ['*://' + url.hostname + '/*'], 'mainV2.ts');
    addChibiUrls('bato', ['*://' + url.hostname + '/*'], 'mainV3.ts');
  }
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

  for (const url of urls) {
    addChibiUrls('MangaPark', ['*://' + url.hostname + '/*']);
  }
}

function addpageUrls(page, urls) {
  let file = JSON.parse(fs.readFileSync(path.resolve(`./src/pages/${page}/meta.json`), 'utf8'));

  for (const url of urls) {
    if (!file.urls.match.includes(url)) {
      file.urls.match.push(url);
    }
  }

  fs.writeFileSync(
    path.resolve(`./src/pages/${page}/meta.json`),
    JSON.stringify(file, null, 2) + '\n',
  );
}

function addChibiUrls(page, urls, mainName = 'main.ts') {
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

  for (const url of urls) {
    if (!matchUrls.includes(url)) {
      matchUrls.push(url);
    }
  }

  const updatedFile = file.replace(
    matchRegex,
    `match: [${matchUrls.map(url => `'${url}'`).join(', ')}]`,
  );
  fs.writeFileSync(
    path.resolve(`src/pages-chibi/implementations/${page}/${mainName}`),
    updatedFile,
  );
}

function addPlayerUrls(key, urls) {
  let file = fs.readFileSync(path.resolve('./src/pages/playerUrls.js'), 'utf8');

  const comment = `      // auto-${key}-replace-dont-remove`;

  let data = '';
  for (const url of urls) {
    if (!file.includes(url)) {
      data += `      '*://${url}',\n`;
    }
  }
  data += comment;
  file = file.replace(comment, data);

  fs.writeFileSync(path.resolve('./src/pages/playerUrls.js'), file);
}

async function start() {
  let lastError = null;
  const tasks = {
    voe,
    // vidmoly,
    // mixdrop,
    zoro,
    // kickassanime,
    animekai,
    bato,
    mangapark,
  };

  for (const key of Object.keys(tasks)) {
    await tasks[key]().catch(e => {
      console.error(`[${key}]:`, e);
      lastError = e;
    });
  }

  if (lastError) {
    throw new Error('Some tasks failed');
  }
}

start();
