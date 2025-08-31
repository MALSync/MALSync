import { PageInterface } from '../../pageInterface';

export const mangaNato: PageInterface = {
  name: 'MangaNato',
  database: 'MangaNato',
  domain: [
    'https://manganato.gg',
    'https://natomanga.com',
    'https://nelomanga.com',
    'https://mangakakalot.gg',
  ],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: [
      '*://*.manganato.gg/*',
      '*://*.natomanga.com/*',
      '*://*.nelomanga.com/*',
      '*://*.mangakakalot.gg/*',
    ],
  },
  search: 'https://manganato.gg/search/story/{searchterm(_)[noSpecial]}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelectorAll('[itemtype="http://schema.org/Thing"]')
        .at(1)
        .getAttribute('title')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter[_-](\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.btn-navigation-chap .back')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.container-chapter-reader img',
          mode: 'countAbove',
        },
        total: {
          selector: '.container-chapter-reader img',
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
      return $c.querySelector('.manga-info-text h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.manga-info-chapter').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-list .row').run();
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
        .title()
        .contains('Error 404')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
