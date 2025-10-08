import { PageInterface } from '../../pageInterface';

export const Novelfire: PageInterface = {
  name: 'Novelfire',
  domain: 'https://novelfire.net',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://novelfire.net/*'],
  },
  computedType: $c => {
    return $c.string('novel').run();
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(5).matches('chapter[_-]').run();
    },
    getTitle($c) {
      return $c.url().querySelector('.booktitle').text().ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter[_-](\\d+)', 1).number().run();
    },
    getVolume($c) {
      return $c
        .querySelector('.chapter-title')
        .ifNotReturn()
        .text()
        .regex('Vol(ume)? (\\d+)', 2)
        .ifNotReturn()
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.chapternav a[rel="next"][href*="https"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#content p',
          mode: 'countAbove',
        },
        total: {
          selector: '#content p',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('book').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).equals('chapters').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.text2row').text().ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.novel-item').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-list > li').run();
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
  },
};
