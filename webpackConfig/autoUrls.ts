import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// players
async function voe() {
    const response = await fetch('https://voe.sx/e/2sqxhth1ukzh', { redirect: 'manual' });
    const url = new URL(response.headers.get("Location"));

    addPlayerUrls('voe', [url.hostname + '/e/*']);
}

async function vidmoly() {
    const response = await fetch("https://vidmoly.me/embed-1abcdefghi1j.html", {redirect: 'manual'})
    const url = new URL(response.headers.get("Location"));

    addPlayerUrls('vidmoly', [url.hostname + '/*']);
}

async function gogostream() {
    const response = await fetch("https://gogoanime.tel/no-game-no-life-episode-9");
    const body = await response.text();

    const iframe = body.match(/<iframe\s+src="(.+?streaming\.php.+?)"/i);

    const gogostream = new URL((iframe[1].startsWith('//') ? "https:" : '') + iframe[1]);

    addPlayerUrls('gogostream', [
        '*.' + gogostream.hostname + '/embedplus*',
        '*.' + gogostream.hostname + '/streaming.php?*',
        '*.' + gogostream.hostname + '/load.php?*',
        '*.' + gogostream.hostname + '/loadserver.php?*',
    ]);

    const $ = cheerio.load(body);

    const servers = [
      {
        name: 'gogostreamsb',
        selector: '.streamsb',
      },
      {
        name: 'gogodood',
        selector: '.doodstream',
      },
      {
        name: 'gogofembed',
        selector: '.xstreamcdn',
      },
    ];

    for (const server of servers) {
      const res = $(`.anime_muti_link ${server.selector} [data-video]`).attr('data-video');
      if (!res) {
        console.error(`[${server.name}]:`, 'no data-video');
        continue;
      }
      const url = new URL(res);
      addPlayerUrls(server.name, [
        url.hostname + '/e/*',
      ]);
    }
}

// pages
async function nineanime() {
    const response = await fetch('https://aniwave.tv');
    const body = await response.text();

    const $ = cheerio.load(body);

    const urls = $('ul > li > a[target="_blank"]:not(:contains(alternative)):not(:contains(lite))').map((i,el) =>  new URL($(el).attr('href'))).get();

    for(const url of urls) {
        addpageUrls('nineAnime', [
            "*://*." + url.hostname + "/watch/*",
            "*://*." + url.hostname + "/watch2gether/*"
        ])
    }
}

async function zoro() {
    const response = await fetch("https://zoroanime.net");
    const body = await response.text();

    const $ = cheerio.load(body);

    const urls = $('div.site-mirror .i-url a').map((i,el) =>  new URL($(el).attr('href'))).get();

    for(const url of urls) {
        addpageUrls('Zoro', [
            "*://" + url.hostname + "/*"
        ])
    }
}

async function gogoanime() {
    const response = await fetch("https://gogoanime.news");
    const body = await response.text();

    const $ = cheerio.load(body);

    const urls = $('.note_site .site_go a').map((i,el) =>  new URL($(el).attr('href'))).get();

    for(let url of urls) {

        if(url.hostname.startsWith('www')) {
            url = new URL("https://" + url.hostname.split('.').slice(1).join('.'))
        }

        addpageUrls('Gogoanime', [
            "*://*." + url.hostname + "/*",
        ])
    }
}

async function kickassanime() {
    const response = await fetch("https://kickassanimes.info");
    const body = await response.text();

    const $ = cheerio.load(body);

    const urls = $('div.container a.button').map((i,el) =>  new URL($(el).attr('href'))).get();

    for(let url of urls) {
        addpageUrls('KickAssAnime', [
            "*://*." + url.hostname + "/*",
        ])
    }
}


function addpageUrls(page, urls) {
    let file = JSON.parse(fs.readFileSync(path.resolve(`./src/pages/${page}/meta.json`), 'utf8'));

    for (const url of urls) {
        if(!file.urls.match.includes(url)) {
            file.urls.match.push(url);
        }
    }

    fs.writeFileSync(path.resolve(`./src/pages/${page}/meta.json`), JSON.stringify(file, null, 2) + "\n");
}


function addPlayerUrls(key, urls) {
    let file = fs.readFileSync(path.resolve('./src/pages/playerUrls.js'), 'utf8');

    const comment = `      // auto-${key}-replace-dont-remove`;

    let data = "";
    for (const url of urls) {
        if(!file.includes(url)) {
            data += `      '*://${url}',\n`
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
        vidmoly,
        gogostream,
        nineanime,
        // zoro,
        gogoanime,
        kickassanime
    }

    for(const key of Object.keys(tasks)) {
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
