import { PageInterface } from '../../pageInterface';

export const MangaClash: PageInterface = {
  name: 'MangaClash',
  domain: ['https://mangaclash.com/', 'https://toonclash.com/'],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://mangaclash.com/*', '*://toonclash.com/*'],
  },
  search: 'https://mangaclash.com/?s={searchtermPlus}&post_type=wp-manga',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('chapter').run(),
          $c.url().urlPart(3).equals('manga').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1#chapter-heading')
        .text()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .split(' - Chapter ')
        .first()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('ol.breadcrumb li:nth-child(3) a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c.this('overview.getImage').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter-?(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('a.next_page').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('.reading-content img[id]').countAbove().run(),
        total: $c => $c.querySelectorAll('.reading-content img[id]').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().not().run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.c-page__content').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.listing-chapters_wrap .wp-manga-chapter').run();
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
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
