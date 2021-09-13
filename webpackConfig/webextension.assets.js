const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');
const mkdirp = require('mkdirp');
const download = require('download-file');
const playerUrls = require('../src/pages/playerUrls');
const pageUrls = require('./utils/pageUrls');
const packageJson = require('../package.json');
const resourcesJson = require('./resources');
const i18n = require('./utils/i18n');
const pagesUtils = require('./utils/pages');
const pages = pagesUtils.pages();

const mode = process.env.MODE || 'default';
console.log('Mode', mode);

const malUrls = { myanimelist: pageUrls.myanimelist };
const aniUrls = { anilist: pageUrls.anilist };
const kitsuUrls = { anilist: pageUrls.kitsu };
const simklUrls = { anilist: pageUrls.simkl };
const malsyncUrls = { anilist: pageUrls.malsync };
const malsyncPwaUrls = { anilist: pageUrls.malsyncPwa };

const contentUrls = pageUrls;
delete contentUrls.anilist;
delete contentUrls.myanimelist;
delete contentUrls.kitsu;
delete contentUrls.simkl;
delete contentUrls.malsync;
delete contentUrls.malsyncPwa;

const generateMatchExcludes = urls => {
  let match = [];
  let exclude = [];
  for (const key in urls) {
    const el = urls[key];
    if (typeof el.match !== 'undefined') match = match.concat(el.match);
    if (typeof el.exclude !== 'undefined') exclude = exclude.concat(el.exclude);
  }
  return { match, exclude };
};

const backgroundMatch = matches => {
  for (let i = 0; i < matches.length; i++) {
    matches[i] = `${matches[i]}*mal-sync-background=*`;
  }
  return matches;
};

const backgroundUrls = pagesUtils.pagesUrls();

var content_scripts = [
  {
    matches: generateMatchExcludes(malUrls).match,
    exclude_globs: generateMatchExcludes(malUrls).exclude.concat(['*mal-sync-background=*']),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/mal-script.js'],
    run_at: 'document_start',
  },
  {
    matches: generateMatchExcludes(malsyncUrls).match,
    exclude_globs: generateMatchExcludes(malsyncUrls).exclude.concat(['*mal-sync-background=*']),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/oauth-script.js'],
    run_at: 'document_start',
  },
  {
    matches: generateMatchExcludes(aniUrls).match,
    exclude_globs: generateMatchExcludes(aniUrls).exclude.concat(['*mal-sync-background=*']),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/anilist-script.js'],
    run_at: 'document_start',
  },
  {
    matches: generateMatchExcludes(kitsuUrls).match,
    exclude_globs: generateMatchExcludes(kitsuUrls).exclude.concat(['*mal-sync-background=*']),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/kitsu-script.js'],
    run_at: 'document_start',
  },
  {
    matches: generateMatchExcludes(simklUrls).match,
    exclude_globs: generateMatchExcludes(simklUrls).exclude.concat(['*mal-sync-background=*']),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/simkl-script.js'],
    run_at: 'document_start',
  },
  {
    matches: generateMatchExcludes(malsyncPwaUrls).match,
    exclude_globs: generateMatchExcludes(malsyncPwaUrls).exclude.concat(['*mal-sync-background=*']),
    js: ['content/pwa-script.js'],
    run_at: 'document_start',
  },
  {
    matches: backgroundMatch(generateMatchExcludes(backgroundUrls).match),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/update-check.js'],
    all_frames: true,
    run_at: 'document_start',
  },
];

pages.forEach(el => {
  const cUrls = pagesUtils.urls(el);
  if (!cUrls.match.length) {
    console.error(`${el} has no urls`);
    return;
  }
  content_scripts.push({
    matches: generateMatchExcludes({urls: cUrls }).match,
    exclude_globs: generateMatchExcludes({urls: cUrls}).exclude.concat(['*mal-sync-background=*']),
    js: ['vendor/jquery.min.js', 'i18n.js', 'content/page_'+el+'.js', 'content/content-script.js'],
    run_at: 'document_start',
  });
})

content_scripts.push({
  matches: generateMatchExcludes(playerUrls).match,
  js: ['vendor/jquery.min.js', 'i18n.js', 'content/iframe.js'],
  all_frames: true,
  run_at: 'document_start',
});

const generateManifest = () => {
  const mani = {
    manifest_version: 2,
    name: packageJson.productName,
    version: packageJson.version,
    description: '__MSG_Package_Description__',
    author: packageJson.author,
    default_locale: 'en',
    applications: {
      gecko: {
        id: '{ceb9801e-aa0c-4bc6-a6b0-9494f3164cc7}',
      },
    },
    background: {
      scripts: ['vendor/jquery.min.js', 'background.js'],
    },
    browser_action: {
      default_popup: 'popup.html',
      default_icon: 'icons/icon16.png',
    },
    options_ui: {
      page: 'settings.html',
      browser_style: false,
    },
    commands: {
      _execute_browser_action: {
        suggested_key: {
          default: 'Alt+M',
          windows: 'Alt+M',
          mac: 'Alt+M',
        },
      },
    },
    content_scripts: content_scripts,
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
    web_accessible_resources: ['vendor/*', 'assets/*', 'icons/*', 'window.html'],
    permissions: [
      'storage',
      'alarms',
      'webRequest',
      'webRequestBlocking',
      'https://myanimelist.net/',
      'notifications',
      'https://myanimelist.cdn-dena.com/',
      'https://cdn.myanimelist.net/',
      'https://*.anilist.co/',
      'https://graphql.anilist.co/',
      'https://kitsu.io/',
      'https://media.kitsu.io/',
      'https://api.simkl.com/',
      'https://www.netflix.com/',
      'https://vrv.co/',
      'https://discover.hulu.com/',
      'https://www.primevideo.com/',
      'https://www.crunchyroll.com/',
      'https://beta-api.crunchyroll.com/',
      'https://api.malsync.moe/',
      'https://api.myanimelist.net/',
      'https://api.mangadex.org/',
      'tabHide',
    ],
    optional_permissions: ['webNavigation', 'http://*/*', 'https://*/*'].concat(
      generateMatchExcludes(backgroundUrls).match,
    ),
  };

  if (mode === 'travis') {
    delete mani.applications;
  } else if (mode === 'dev') {
    delete mani.applications;
    mani.name = `${mani.name} (DEV)`;
    mani.version = new Date()
      .toISOString()
      .replace(/T.*/, '')
      .replace(/-/g, '.');
  }

  return JSON.stringify(mani, null, 2);
};
mkdirp(path.join(__dirname, '../dist/webextension'), err => {
  fs.writeFile(
    path.join(__dirname, '../dist/webextension/manifest.json'),
    generateManifest(),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  fs.writeFile(
    path.join(__dirname, '../dist/webextension/i18n.js'),
    `const i18n = ${JSON.stringify(i18n())}`,
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  extra.copy(
    path.join(__dirname, '../node_modules/jquery/dist/jquery.min.js'),
    path.join(__dirname, '../dist/webextension/vendor/jquery.min.js'),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  extra.copy(
    path.join(__dirname, '../src/minimal/window.html'),
    path.join(__dirname, '../dist/webextension/window.html'),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  extra.copy(
    path.join(__dirname, '../src/minimal/popup.html'),
    path.join(__dirname, '../dist/webextension/popup.html'),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  extra.copy(
    path.join(__dirname, '../src/installPage/install.html'),
    path.join(__dirname, '../dist/webextension/install.html'),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  extra.copy(
    path.join(__dirname, '../src/minimal/settings.html'),
    path.join(__dirname, '../dist/webextension/settings.html'),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  extra.copy(
    path.join(__dirname, '../assets/'),
    path.join(__dirname, '../dist/webextension/'),
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    },
  );

  for (const key in resourcesJson) {
    const url = resourcesJson[key];

    const options = {
      directory: './dist/webextension/vendor/',
      filename: key,
    };

    download(url, options, function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  }
});
