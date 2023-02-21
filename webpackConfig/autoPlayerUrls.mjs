import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function voe() {
    const response = await fetch("https://voe.sx/e/0123456789ab", {redirect: 'manual'})
    const url = new URL(response.headers.get("Location"));

    addPlayerUrls('voe', [url.hostname + '/e/*']);
}

async function gogostream() {
    const response = await fetch("https://gogoanime.tel/no-game-no-life-episode-9");
    const body = await response.text();

    const iframe = body.match(/<iframe\s+src="(.+?streaming\.php.+?)"/i);

    const url = new URL((iframe[1].startsWith('//') ? "https:" : '') + iframe[1]);

    addPlayerUrls('gogostream', [
        '*.' + url.hostname + '/embedplus*',
        '*.' + url.hostname + '/streaming.php?*',
        '*.' + url.hostname + '/load.php?*',
        '*.' + url.hostname + '/loadserver.php?*',
    ]);
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
    await voe();
    await gogostream();
}

start();