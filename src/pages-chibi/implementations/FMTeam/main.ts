import { PageInterface } from '../../pageInterface';

export const FMTeam: PageInterface = {
  name: 'FMTeam',
  domain: 'https://fmteam.fr',
  languages: ['French'],
  type: 'manga',
  urls: {
    match: ['*://fmteam.fr/*'],
  },
  search: 'https://fmteam.fr/mangas?search={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('read').run();
    },
    getTitle($c) {
      return $c
        .querySelector('#reader-sidebar .sidebar-section h4')
        .text()
        .trim()
        .ifNotReturn()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('#reader-sidebar .back-link')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().regex('/ch/(\\d+)', 1).ifNotReturn().number().run();
    },
    getVolume($c) {
      return $c.url().regex('/vol/(\\d+)', 1).ifNotReturn().number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelectorAll('.page-nav-btn.chapter-btn')
        .last()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c =>
          $c.querySelector('.sidebar-page-info #cur-page-side').text().trim().number().run(),
        total: $c =>
          $c.querySelector('.sidebar-page-info #total-pages-side').text().trim().number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('manga').run();
    },
    getTitle($c) {
      // The heading also holds a span with the favourite count
      return $c.querySelector('h1.manga-title').getBaseText().trim().ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('img.manga-cover')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.chapters-header').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapters-list .chapter-item').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').regex('/ch/(\\d+)', 1).ifNotReturn().number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#reader-sidebar .sidebar-section h4').boolean().run())
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('.chapters-list .chapter-item').boolean().run())
        .trigger()
        .run();
    },
  },
};
