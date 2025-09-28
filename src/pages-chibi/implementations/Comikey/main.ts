import { PageInterface } from '../../pageInterface';

export const Comikey: PageInterface = {
  name: 'Comikey',
  domain: 'https://comikey.com/',
  languages: ['English', 'Indonesian', 'Spanish', 'Portuguese'],
  type: 'manga',
  urls: {
    match: ['*://*.comikey.com/*'],
  },
  search: 'https://comikey.com/comics/?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('read').run(),
          $c.url().urlPart(6).boolean().run(),
          $c.url().urlPart(6).matches('(?:chapter|episode|espanol|bahasa|portugues)[_-]?').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.br-toolbar__ellipsis').text().split(' (').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-[^-]+$', '').split('-pt').at(0).run();
    },
    getImage($c) {
      return $c.querySelector('.logo img').getAttribute('src').urlAbsolute().ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.br-toolbar__ellipsis')
        .getAttribute('href')
        .urlAbsolute()
        .ifNotReturn()
        .run();
    },
    getEpisode($c) {
      return $c
        .url()
        .urlPart(6)
        .regex('(?:chapter|episode|espanol|bahasa|portugues)[_-]?(\\d+)', 1)
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.next a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: '#br-spine canvas',
        current: {
          selector: '#br-spine canvas',
          mode: 'countAbove',
        },
        total: {
          selector: '#br-spine canvas',
          mode: 'count',
        },
      },
      {
        condition: '#br-spine img',
        current: {
          selector: '#br-spine img',
          mode: 'countAbove',
        },
        total: {
          selector: '#br-spine img',
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
          $c.url().urlPart(3).equals('comics').run(),
          $c.url().urlPart(6).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.sub-data .title').text().split(' (').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.description').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapters .chrow').run();
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
      return $c
        .detectChanges($c.title().ifNotReturn().run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .waitUntilTrue($c.url().urlPart(3).equals('comics').run())
        .detectChanges($c.querySelector('#chapters').ifNotReturn().text().run(), $c.trigger().run())
        .run();
    },
    syncIsReady($c) {
      // For avoiding syncing locked chapter
      return $c.waitUntilTrue($c.querySelector('#br-spine').isNil().not().run()).trigger().run();
    },
  },
};
