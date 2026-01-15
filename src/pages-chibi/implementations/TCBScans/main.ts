import { PageInterface } from '../../pageInterface';

export const TCBScans: PageInterface = {
  name: 'TCBScans',
  domain: 'https://tcbonepiecechapters.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://tcbonepiecechapters.com/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().run(), $c.url().urlPart(3).equals('chapters').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().split('- Chapter').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/mangas/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .url()
        .urlPart(5)
        .split('-chapter-')
        .at(1)
        .regex('^(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[href^="/chapters/"]:last-of-type')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.fixed-ratio img',
          mode: 'countAbove',
        },
        total: {
          selector: '.fixed-ratio img',
          mode: 'count',
        },
      },
      /*
      {
        current: $c => $c.querySelectorAll('.fixed-ratio img'').countAbove().run(),
        total: $c => $c.querySelectorAll('.fixed-ratio img'"]').count().run(),
      },
      */
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().run(), $c.url().urlPart(3).equals('mangas').run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1')
        .text()
        .trim()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).trim().run();
    },
    getImage($c) {
      return $c.querySelector('.py-3 img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href^="/chapters/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
