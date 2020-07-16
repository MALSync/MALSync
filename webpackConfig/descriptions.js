const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');

require('ts-node').register({
  project: './tsconfig.node.json',
  files: './globals.d.ts',
});

const pages = Object.values(require('../src/pages/pages.ts').pages);

pages.sort(function(a, b) {
  const textA = a.name.toUpperCase();
  const textB = b.name.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
});

const hpages = Object.values(require('../src/pages-adult/pages.ts').pages);

hpages.sort(function(a, b) {
  const textA = a.name.toUpperCase();
  const textB = b.name.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
});

createTable();
function createTable() {
  let animehtml = '';
  let mangahtml = '';

  for (let page in pages) {
    page = pages[page];

    if (typeof page.domain === 'object') page.domain = page.domain[0];

    const htmlContent = `<tr>
    <td><a href="${page.domain}"><img src="https://www.google.com/s2/favicons?domain=${page.domain}"> ${
      page.name
    }</a></td>
    <td>${page.languages.join(', ')}</td>
    ${rowCondition(typeof page.overview !== 'undefined')}
    ${rowCondition(typeof page.sync.nextEpUrl !== 'undefined')}
    ${rowCondition(typeof page.database !== 'undefined')}
    ${rowCondition(typeof page.overview !== 'undefined' && typeof page.overview.list !== 'undefined')}
  </tr>`;

    if (typeof page.type !== undefined && page.type === 'anime') animehtml += htmlContent;
    else mangahtml += htmlContent;
  }

  const html = `
  <h1>Anime</h1>
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Languages</th>
        <th>Overview Page</th>
        <th>Next Episode</th>
        <th>Database Support</th>
        <th>Update Check</th>
      </tr>
    </thead>
    <tbody>
      ${animehtml}
    </tbody>
  </table>
  <h1>Manga</h1>
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Languages</th>
        <th>Overview Page</th>
        <th>Next Chapter</th>
        <th>Database Support</th>
        <th>Update Check</th>
      </tr>
    </thead>
    <tbody>
      ${mangahtml}
    </tbody>
  </table>
  `;

  fs.writeFile(path.join(__dirname, '../pages.md'), html, err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  function rowCondition(con) {
    if (con) return '<td>:heavy_check_mark:</td>';
    return '<td>:x:</td>';
  }
}

adultDep();
function adultDep() {
  let html = `
  <table>
    <tbody>
      `;
  for (let page in hpages) {
    page = hpages[page];

    if (typeof page.domain === 'object') page.domain = page.domain[0];

    html += `<tr>
              <td><a href="${page.domain}"><img src="https://www.google.com/s2/favicons?domain=${page.domain}"> ${page.name}</a></td>
            </tr>`;
  }
  html += `
    </tbody>
  </table>
  `;

  const descFile = path.join(__dirname, '../src/pages-adult/README.md');
  fs.readFile(descFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(/<!--pages-->((.|\n|\r)*)<!--\/pages-->/g, `<!--pages-->${html}<!--/pages-->`);

    fs.writeFile(descFile, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

readMe();
function readMe() {
  const pageList = Object.values(require('../src/pages/pages.ts').pages);

  const animes = [];
  const mangas = [];
  const medias = [
    '<a href="http://app.emby.media"><img src="https://www.google.com/s2/favicons?domain=app.emby.media"></a> <a href="http://app.emby.media">Emby</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex">[Wiki]</a>',
    '<a href="http://app.plex.tv"><img src="https://www.google.com/s2/favicons?domain=http://app.plex.tv"></a> <a href="http://app.plex.tv">Plex</a> <a href="https://github.com/MALSync/MALSync/wiki/Emby-Plex">[Wiki]</a>',
  ];

  for (var page in pageList) {
    page = pageList[page];

    if (typeof page.domain === 'object') page.domain = page.domain[0];

    const str = `<a href="${page.domain}"><img src="https://www.google.com/s2/favicons?domain=${page.domain}"> ${page.name}</a>`;

    if (page.name === 'Emby' || page.name === 'Plex') {
      continue;
    }

    if (page.name === 'MangaNelo') {
      mangas.push(
        '<a href="https://proxer.me"><img src="https://www.google.com/s2/favicons?domain=https://proxer.me"> Proxer</a>',
      );
    }

    if (page.type === 'anime') {
      animes.push(str);
    } else {
      mangas.push(str);
    }
  }

  let html = `
  <table>
    <thead>
      <tr>
        <th>Anime</th>
        <th>Manga</th>
        <th>Media Server</th>
      </tr>
    </thead>
    <tbody>
      `;
  for (var page in animes) {
    anime = animes[page];
    manga = mangas[page];
    media = medias[page];
    if (typeof manga === 'undefined') manga = '';
    if (typeof media === 'undefined') media = '';

    html += `<tr>
                <td>${anime}</td>
                <td>${manga}</td>
                <td>${media}</td>
              </tr>`;
  }
  html += `
    </tbody>
  </table>
  `;

  const descFile = path.join(__dirname, '../README.md');
  fs.readFile(descFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(/<!--pages-->((.|\n|\r)*)<!--\/pages-->/g, `<!--pages-->${html}<!--/pages-->`);

    fs.writeFile(descFile, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

createJson();
function createJson() {
  const pageList = Object.values(require('../src/pages/pages.ts').pages);
  const res = [];
  for (var page in pageList) {
    page = pageList[page];

    if (typeof page.domain === 'object') page.domain = page.domain[0];
    res.push({
      domain: page.domain,
      type: page.type,
      name: page.name
    })
  }

  const descFile = path.join(__dirname, '../src/pages/list.json');
  fs.writeFile(descFile, JSON.stringify(res, null, 2), 'utf8', function(err) {
    if (err) return console.log(err);
  });
}
