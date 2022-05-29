const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const pagesUtils = require('./utils/pages');
const playerUrls = require('../src/pages/playerUrls');
const mkdirp = require('mkdirp');

main();
async function main() {
  console.log('Downloading');
  mkdirp.sync(path.join(__dirname, '../dist/lastExtension'));
  await ex(
    'curl -fsSL https://github.com/MALSync/MALSync/releases/latest/download/webextension.zip -o dist/lastExtension.zip',
  );
  console.log('Extracting');
  try {
    await ex(`tar -xf dist/lastExtension.zip --directory dist/lastExtension`);
  } catch (error) {
    await ex(`unzip -o dist/lastExtension.zip -d dist/lastExtension`);
  }

  const manifest = require('../dist/lastExtension/manifest.json');

  const version = manifest.version;
  const oldUrls = getUrls(manifest);
  const diffUrls = getDiff(oldUrls);
  const descFile = path.join(__dirname, '../src/pages/diffUrls.json');
  console.log(version, diffUrls);
  fs.readFile(descFile, 'utf8', function(err, data) {
    const currentData = JSON.parse(data);
    currentData[version] = diffUrls;

    fs.writeFile(descFile, JSON.stringify(currentData, null, 2), 'utf8', function (err) {
      if (err) throw err;
    });
  });
}

function getDiff(oldUrls) {
  res = {};

  const oldPages = fs.readdirSync(path.join(__dirname, '../dist/lastExtension/content'))
    .filter(el => el.startsWith('page_') && el.endsWith('.js'))
    .map(el => el.replace('page_', '').replace('.js', ''))

  // Page urls
  oldPages.forEach(page => {
    try {
      const urls = pagesUtils.urls(page);
      const diffUrls = urls.match.filter(el => !oldUrls.includes(el)).map(el => formatUrls(el));
      if (diffUrls.length) {
        res[page] = diffUrls;
      }
    } catch (err) {
      return
    }
  });

  // Iframe urls
  res['iframe'] = pagesUtils
    .generateMatchExcludes(playerUrls)
    .match.filter(el => !oldUrls.includes(el))
    .map(el => formatUrls(el));

  return res;
}

function formatUrls(url) {
  const urlParts = url.split('/');
  urlParts[0] = urlParts[0].replace('*:', 'https:');
  urlParts[2] = urlParts[2].replace(/^\*\./gi, '');
  return urlParts.join('/');
}

function getUrls(manifest) {
  const urls = [];
  if (manifest.content_scripts) {
    manifest.content_scripts.forEach(script => {
      if (script.matches) {
        script.matches.forEach(url => {
          urls.push(url);
        });
      }
    });
  }
  return urls;
}

async function ex(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}
