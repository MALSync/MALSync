import { PageInterface } from '../../pageInterface';

export const TritiniaScans: PageInterface = {
  name: 'TritiniaScans',
  domain: 'https://tritinia.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://tritinia.org/*'],
  },
  search:
    'https://tritinia.org/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('(?:chapter|ch)[_-]?').run(),
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
      return $c.url().urlPart(5).regex('(?:chapter|ch)[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.next_page').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('#single-pager').boolean().run(),
        current: $c =>
          $c
            .querySelector('#single-pager')
            .selectedText()
            .regex('(\\d+)/(\\d+)$', 1)
            .number()
            .run(),
        total: $c =>
          $c
            .querySelector('#single-pager option')
            .text()
            .trim()
            .regex('(\\d+)/(\\d+)$', 2)
            .number()
            .run(),
      },
      {
        current: $c => $c.querySelectorAll('.reading-content img').countAbove().run(),
        total: $c => $c.querySelectorAll('.reading-content img').length().run(),
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
      return $c.querySelector('.post-content').uiAppend().run();
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
      return $c
        .if(
          $c.url().urlPart(5).boolean().run(),
          $c.detectChanges($c.url().urlPart(5).run(), $c.trigger().run()).run(),
          $c.run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      // When clicking for prev/next chapter in page mode, it loading too slow causing the chapter sync to MAL without reading it yet
      return $c
        .waitUntilTrue($c.querySelector('.read-container .fa-spinner').isNil().run())
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.version-chap').boolean().run()).trigger().run();
    },
  },
};
