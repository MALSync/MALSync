import { PageInterface } from '../../pageInterface';

export const ComicTop: PageInterface = {
  name: 'ComicTop',
  domain: 'https://comic-top.com/',
  languages: ['Japanese'],
  type: 'manga',
  urls: {
    match: ['*://comic-top.com/*'],
  },
  search: 'https://comic-top.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      // This website literally have 2 different page for same chapter with different interface
      return $c
        .and(
          $c
            .or(
              $c.url().urlPart(3).equals('viewer').run(),
              $c.url().urlPart(3).matches('chapter-').run(),
            )
            .run(),
          $c.url().urlPart(3).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('.manga-info font').text().trim().run(),
          $c.querySelector('.epx a').text().trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      // Using coalesce cause MalSync to stop at Is Sync Page
      return $c
        .if(
          $c.url().urlParam('ct').boolean().run(),
          $c.url().urlParam('ct').ifNotReturn().split('-chapter').at(0).trim().run(),
          $c.url().urlPart(3).split('-chapter').at(0).trim().run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/manga/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .if(
          $c.url().urlParam('ct').boolean().run(),
          $c.url().urlParam('ct').ifNotReturn().regex('chapter[-_]?.*?(\\d+)', 1).number().run(),
          $c.url().urlPart(3).regex('chapter[-_]?.*?(\\d+)', 1).number().run(),
        )
        .run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.rght a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: '#slider-bar',
        current: {
          selector: '.slider-page',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '.slider-page',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
      {
        condition: '.select_paged',
        current: {
          selector: '.select_paged option:selected',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '.select_paged option:selected',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
      {
        current: {
          selector: '.reader-area img',
          mode: 'countAbove',
        },
        total: {
          selector: '.reader-area img',
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
      return $c
        .coalesce(
          $c.querySelector('.entry-title font').text().trim().run(), // Google translate cause element turn to this
          $c.querySelector('.entry-title').text().trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episode-manga li').run();
    },
    elementUrl($c) {
      return $c.find('.epsleft a').getAttribute('href').urlAbsolute().run();
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
