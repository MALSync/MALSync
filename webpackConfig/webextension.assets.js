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
        'vendor/jquery.min.js',
        'background.js'
      ]
    },
    'browser_action': {
      'default_popup': 'popup.html',
      'default_icon': 'icons/icon16.png'
    },
    'content_scripts': [
      {
        'matches': generateMatchExcludes().match,
        'exclude_globs': generateMatchExcludes().exclude,
        'js': [
          'vendor/jquery.min.js',
          'content-script.js'
        ],
        "run_at": "document_start"
      }
    ],
    'icons': {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    },
    'web_accessible_resources': [
      'vendor/*',
      'assets/*',
    ],
    'permissions': [
      "storage",
      "alarms",
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

  extra.copy(path.join(__dirname, '../src/minimal/popup.html'), path.join(__dirname, '../dist/webextension/popup.html'), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  extra.copy(path.join(__dirname, '../assets/'), path.join(__dirname, '../dist/webextension/'), (err) => {
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
