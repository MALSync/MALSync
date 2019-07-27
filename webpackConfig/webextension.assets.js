const package = require('../package.json');
const pageUrls = require('../src/pages/pageUrls');
const playerUrls = require('../src/pages/playerUrls');

const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');
const mkdirp = require('mkdirp');
const download = require('download-file');
const resourcesJson = require('./resources');
const i18n = require('./utils/i18n');
const mode = process.env.MODE || 'default';
console.log('Mode', mode);

var malUrls = {myanimelist: pageUrls.myanimelist};
var aniUrls = {anilist: pageUrls.anilist};
var kitsuUrls = {anilist: pageUrls.kitsu};
var simklUrls = {anilist: pageUrls.simkl};

var contentUrls = pageUrls;
delete contentUrls.anilist;
delete contentUrls.myanimelist;
delete contentUrls.kitsu;
delete contentUrls.simkl;

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

var applications = {
  'gecko': {
    'id': '{ceb9801e-aa0c-4bc6-a6b0-9494f3164cc7}'
  }
};

if(mode === 'travis') applications = {};

const generateManifest = () => {
  return JSON.stringify({
    'manifest_version': 2,
    'name': package.productName,
    'version': package.version,
    'description': "__MSG_Package_Description__",
    'author': package['author'],
    'default_locale': 'en',
    'applications': applications,
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
    'options_ui': {
      'page': 'settings.html',
      'browser_style': false,
    },
    'commands': {
      '_execute_browser_action': {
        'suggested_key': {
          'default': 'Alt+M',
          'windows': 'Alt+M',
          'mac': 'Alt+M'
        }
      },
      'intro_skip_forward': {
        //'suggested_key': {
        //  'default': 'Ctrl+Right',
        //  'windows': 'Ctrl+Right',
        //  'mac': 'Ctrl+Right'
        //},
        'description': '__MSG_settings_Shortcuts_Skip_Forward__',
      },
      'intro_skip_backward': {
        //'suggested_key': {
        //  'default': 'Ctrl+Left',
        //  'windows': 'Ctrl+Left',
        //  'mac': 'Ctrl+Left'
        //},
        'description': '__MSG_settings_Shortcuts_Skip_Backward__',
      },
    },
    'content_scripts': [
      {
        'matches': generateMatchExcludes(contentUrls).match,
        'exclude_globs': generateMatchExcludes(contentUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'content-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(malUrls).match,
        'exclude_globs': generateMatchExcludes(malUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'mal-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(aniUrls).match,
        'exclude_globs': generateMatchExcludes(aniUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'anilist-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(kitsuUrls).match,
        'exclude_globs': generateMatchExcludes(kitsuUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'kitsu-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(simklUrls).match,
        'exclude_globs': generateMatchExcludes(simklUrls).exclude.concat(['*mal-sync-background=*']),
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'simkl-script.js'
        ],
        "run_at": "document_start"
      },
      {
        'matches': backgroundMatch(generateMatchExcludes(pageUrls).match),
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'update-check.js'
        ],
        "all_frames": true,
        "run_at": "document_start"
      },
      {
        'matches': generateMatchExcludes(playerUrls).match,
        'js': [
          'vendor/jquery.min.js',
          'i18n.js',
          'iframe.js',
        ],
        "all_frames": true,
        "run_at": "document_start"
      }
    ],
    'icons': {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
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
      "webRequest",
      "webRequestBlocking",
      "https://myanimelist.net/",
      "notifications",
      "https://myanimelist.cdn-dena.com/",
      "https://cdn.myanimelist.net/",
      "https://s3.anilist.co/",
      "https://graphql.anilist.co/",
      "https://kitsu.io/",
      "https://media.kitsu.io/",
      "https://api.simkl.com/",
      "https://www.netflix.com/",
      "https://vrv.co/",
      "tabHide"
    ],
    "optional_permissions": [
      "cookies"
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

  fs.writeFile(path.join(__dirname, '../dist/webextension/i18n.js'), 'const i18n = '+JSON.stringify(i18n()), (err) => {
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

  extra.copy(path.join(__dirname, '../src/minimal/window.html'), path.join(__dirname, '../dist/webextension/window.html'), (err) => {
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

  extra.copy(path.join(__dirname, '../src/installPage/install.html'), path.join(__dirname, '../dist/webextension/install.html'), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  extra.copy(path.join(__dirname, '../src/minimal/settings.html'), path.join(__dirname, '../dist/webextension/settings.html'), (err) => {
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


// Supported pages list
require('ts-node').register({
  "project": "./tsconfig.node.json",
  "files": "./globals.d.ts"
})

var pages = Object.values(require("./../src/pages/pages.ts").pages);

createTable();
function createTable(){
  pages.sort(function(a, b) {
    var textA = a.name.toUpperCase();
    var textB = b.name.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });

  var html = `
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Overview Page</th>
        <th>Next Episode</th>
        <th>Database Support</th>
        <th>Update Check</th>
      </tr>
    </thead>
    <tbody>
      `;
  for (var page in pages){
    page = pages[page];

    if(typeof page.domain === 'object') page.domain = page.domain[0];

    html += `<tr>
              <td><a href="${page.domain}"><img src="https://www.google.com/s2/favicons?domain=${page.domain}"> ${page.name}</a></td>
              ${rowCondition(typeof page.overview !== 'undefined')}
              ${rowCondition(typeof page.sync.nextEpUrl !== 'undefined')}
              ${rowCondition(typeof page.database !== 'undefined')}
              ${rowCondition(typeof page.overview !== 'undefined' && typeof page.overview.list !== 'undefined')}
            </tr>`;
  }
  html += `
    </tbody>
  </table>
  `;

  fs.writeFile(path.join(__dirname, '../pages.md'), html, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  function rowCondition(con){
    if(con) return '<td>:heavy_check_mark:</td>';
    return '<td>:x:</td>';
  }
}

