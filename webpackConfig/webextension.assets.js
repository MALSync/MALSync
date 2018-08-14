const package = require('../package.json');

const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');
const mkdirp = require('mkdirp');

const generateManifest = () => {
  return JSON.stringify({
    'manifest_version': 2,
    'name': package.productName,
    'version': package.version,
    'description': package.description,
    'author': package['author'],
    'content_scripts': [
      {
        'matches': [
          '*://www.crunchyroll.com/*'
        ],
        'js': [
          'content-script.js'
        ],
        "run_at": "document_start"
      }
    ],
    'permissions': [
      "storage",
      "*://www.crunchyroll.com/*",
    ]
  }, null, 2);
};
mkdirp(path.join(__dirname, '../dist/webextension'), (err) => {

  fs.writeFile(path.join(__dirname, '../dist/webextension/manifest.json'), generateManifest(), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

});
