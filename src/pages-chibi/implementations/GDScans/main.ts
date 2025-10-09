import { PageInterface } from '../../pageInterface';

export const GDScans: PageInterface = {
  name: 'GalaxyDegenScans',
  domain: 'https://gdscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://gdscans.com/*'],
  },
  search:
    'https://gdscans.com/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(6).boolean().run(),
          $c.url().urlPart(6).matches('(?:chapter|ch)[_-]?').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.breadcrumb a[href*="/manga/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.breadcrumb a[href*="/manga/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).regex('(?:chapter|ch)[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    getVolume($c) {
      return $c.url().urlPart(5).regex('volume[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.next_page').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: '#single-pager',
        current: {
          selector: '#single-pager [selected="selected"]',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '#single-pager option',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
      {
        current: {
          selector: '.reading-content img',
          mode: 'countAbove',
        },
        total: {
          selector: '.reading-content img',
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
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.post-title h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.post-rating').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.wp-manga-chapter').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
      return $c.domReady().trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.version-chap').boolean().run()).trigger().run();
    },
  },
};
