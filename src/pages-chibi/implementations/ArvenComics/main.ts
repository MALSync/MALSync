import { PageInterface } from '../../pageInterface';

export const ArvenComics: PageInterface = {
  name: 'ArvenComics',
  domain: 'https://arvencomics.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://arvencomics.com/*'],
  },
  search:
    'https://arvencomics.com/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(3).equals('comic').run(),
          $c.url().urlPart(5).matches('(?:chapter[_-]?)(\\d+)|(\\d+)').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split(' - ').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/comic/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('(?:chapter|)[-_]?(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.next_page').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
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
        .and($c.url().urlPart(5).boolean().not().run(), $c.url().urlPart(3).equals('comic').run())
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
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('.summary_image img').getAttribute('src').log().ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.post-content').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.version-chap .wp-manga-chapter').run();
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
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c.querySelector('#manga-chapters-holder').find('.wp-manga-chapter').isNil().not().run(),
        )
        .trigger()
        .run();
    },
  },
};
