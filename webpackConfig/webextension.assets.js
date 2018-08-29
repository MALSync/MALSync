const package = require('../package.json');
const pageUrls = require('../src/pages/pageUrls');

const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');
const mkdirp = require('mkdirp');
const download = require('download-file');
const resourcesJson = require('./resources');

const generateMatchExcludes = () => {
  var match = [];
  var exclude = [];
  for (var key in pageUrls) {
    var el = pageUrls[key];
    if(typeof el.match !== "undefined") match = match.concat(el.match);
    if(typeof el.exclude !== "undefined") exclude = exclude.concat(el.exclude);
  }
  return {match: match, exclude: exclude}
}

const generateManifest = () => {
  return JSON.stringify({
    'manifest_version': 2,
    'name': package.productName,
    'version': package.version,
    'description': package.description,
    'author': package['author'],
    'background': {
      'scripts': [
        'background.js'
      ]
    },
    'content_scripts': [
      {
        'matches': generateMatchExcludes().match,
        'js': [
          'vendor/jquery.min.js',
          'content-script.js'
        ],
        "run_at": "document_start"
      }
    ],
    'permissions': [
      "storage",
      "https://myanimelist.net/"
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

  extra.copy(path.join(__dirname, '../node_modules/jquery/dist/jquery.min.js'), path.join(__dirname, '../dist/webextension/vendor/jquery.min.js'), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  for (var key in resourcesJson) {
    var url = resourcesJson[key];

    var options = {
        directory: "./dist/webextension/vendor/",
        filename: key
    }

    download(url, options, function(err){
      if (err) {
        console.error(err);
        process.exit(1);
      }
    })
  }

});
