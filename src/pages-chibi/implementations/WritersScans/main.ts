import { PageInterface } from '../../pageInterface';

export const WritersScans: PageInterface = {
  name: 'WritersScans',
  domain: 'https://writerscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://writerscans.com/*'],
  },
  search: 'https://writerscans.com/series?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('chapter').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.opacity-100[alt]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.opacity-100[alt]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.opacity-100[alt]')
        .parent()
        .text()
        .regex('chapter[ _-]?(\\d+)', 1)
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('img[src*="arrow-right"]')
        .ifNotReturn()
        .parent()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#pages img',
          mode: 'countAbove',
        },
        total: {
          selector: '#pages img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(4).matches('genre').boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').parent().uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapters a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('title').regex('chapter[ _-]?(\\d+)', 1).number().run();
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
