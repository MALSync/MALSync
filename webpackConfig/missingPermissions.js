const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

main();
async function main() {
  await ex(
    'curl -fsSL https://github.com/MALSync/MALSync/releases/latest/download/webextension.zip -o dist/lastExtension.zip',
  );
  await ex(`unzip dist/lastExtension.zip -d dist/lastExtension`);

  const oldUrls = getUrls(require('../dist/lastExtension/manifest.json'));
  const newUrls = getUrls(require('../dist/webextension/manifest.json'));
  const diffUrls = newUrls.filter(el => !oldUrls.includes(el)).map(el => formatUrls(el));
  const descFile = path.join(__dirname, '../src/pages/diffUrls.json');
  console.log(diffUrls);
  fs.writeFile(descFile, JSON.stringify(diffUrls, null, 2), 'utf8', function (err) {
    if (err) throw err;
  });
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
