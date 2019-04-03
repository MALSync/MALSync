const package = require('../package.json');
const pageUrls = require('../src/pages/pageUrls');
const playerUrls = require('../src/pages/playerUrls');

const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');
const mkdirp = require('mkdirp');
const download = require('download-file');
const resourcesJson = require('./resources');

var malUrls = {myanimelist: pageUrls.myanimelist};
var aniUrls = {anilist: pageUrls.anilist};
var kitsuUrls = {anilist: pageUrls.kitsu};

var contentUrls = pageUrls;
delete contentUrls.anilist;
delete contentUrls.myanimelist;
delete contentUrls.kitsu;

const generateMatchExcludes = (urls) => {
  var match = [];
  var exclude = [];
  for (var key in urls) {
    var el = urls[key];
    if(typeof el.match !== "undefined") match = match.concat(el.match);
    if(typeof el.exclude !== "undefined") exclude = exclude.concat(el.exclude);
  }
  return {match: match, exclude: exclude}
}

const backgroundMatch = (matches) => {
  for(var i=0;i<matches.length;i++){
      matches[i]=matches[i]+'*mal-sync-background=*';
  }
  return matches;
}

const generateManifest = () => {
  return JSON.stringify({
    'manifest_version': 2,
    'name': package.productName,
    'version': package.version,
    'description': package.description,
    'author': package['author'],
    'applications': {
      'gecko': {
        //'id': '{ceb9801e-aa0c-4bc6-a6b0-9494f3164cc7}'
      }
    },
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
    'commands': {
      '_execute_browser_action': {
        'suggested_key': {
          'default': 'Alt+M',
          'windows': 'Alt+M',
          'mac': 'Alt+M'
        }
      },
    },
    'content_scripts': [
      {
        'matches': generateMatchExcludes(contentUrls).match,
        'exclude_globs': generateMatchExcludes(contentUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'content-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(malUrls).match,
        'exclude_globs': generateMatchExcludes(malUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'mal-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(aniUrls).match,
        'exclude_globs': generateMatchExcludes(aniUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'anilist-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(kitsuUrls).match,
        'exclude_globs': generateMatchExcludes(kitsuUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'kitsu-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': backgroundMatch(generateMatchExcludes(pageUrls).match),
        'js': [
          'vendor/jquery.min.js',
          'update-check.js'
        ],
        "all_frames": true,
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(playerUrls).match,
        'js': [
          'iframe.js',
        ],
        "all_frames": true,
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
      "https://myanimelist.net/",
      "notifications",
      "https://myanimelist.cdn-dena.com/",
      "https://cdn.myanimelist.net/",
      "https://s3.anilist.co/",
      "https://graphql.anilist.co/",
      "https://kitsu.io/",
      "tabHide"
    ],
    "optional_permissions": [
      "cookies",
      "webRequest",
      "webRequestBlocking"
    ].concat(generateMatchExcludes(pageUrls).match),
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
