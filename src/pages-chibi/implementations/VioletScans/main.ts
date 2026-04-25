import { PageInterface } from '../../pageInterface';

export const VioletScans: PageInterface = {
  name: 'VioletScans',
  domain: 'https://violetscans.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://violetscans.org/*'],
  },
  search: 'https://violetscans.org/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().not().run(),
          $c.url().urlPart(3).matches('chapter[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.allc a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.allc a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).regex('chapter-(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ch-next-btn')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#select-paged option:selected',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '#select-paged option',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('comics').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.entry-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('.thumb > img').getAttribute('src').log().ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapterlist .chbox').run();
    },
    elementUrl($c) {
      return $c.closest('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.chapternum').text().regex('(\\d+)').number().run();
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
