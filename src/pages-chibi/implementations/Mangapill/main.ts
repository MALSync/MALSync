import { PageInterface } from '../../pageInterface';

export const Mangapill: PageInterface = {
  name: 'Mangapill',
  domain: 'https://mangapill.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://mangapill.com/*'],
  },
  search: 'https://mangapill.com/search?q={searchtermPlus}&type=&status',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(3).equals('chapters').run(),
          $c.url().urlPart(6).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[property="og:title"]') // some chapter doesn't have <title>
        .getAttribute('content')
        .ifNotReturn()
        .regex('^(.*?)(?=\\s*(?:Chapter|Manga|- Mangapill))', 1)
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).split('-chapter-').at(0).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/manga/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).split('-chapter-').at(1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[data-hotkey="ArrowRight"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.lg\\:container chapter-page',
          mode: 'countAbove',
        },
        total: {
          selector: '.lg\\:container chapter-page',
          mode: 'count',
        },
      },
      /*
      {
        current: $c => $c.querySelectorAll('.lg\\:container chapter-page').countAbove().run(),
        total: $c => $c.querySelectorAll('.lg\\:container chapter-page"]').count().run(),
      },
      */
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(6).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.this('sync.getImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('.mb-3 .font-bold').parent().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.grid a[href]').run();
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
