import { PageInterface } from '../../pageInterface';

export const Jestful: PageInterface = {
  name: 'Jestful',
  domain: 'https://jestful.net/',
  languages: ['Japanese'],
  type: 'manga',
  urls: {
    match: ['*://jestful.net/*'],
  },
  search: 'https://jestful.net/manga-list.html?name={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).matches('^bsaq').run(), $c.url().urlPart(4).boolean().not().run())
        .run();
    },
    getTitle($c) {
      return $c.this('overview.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.breadcrumb a[href*="hwms"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).regex('chapter[ _-](\\d+)', 1).number().run();
    },
    readerConfig: [
      {
        current: {
          selector: '.chapter-img',
          mode: 'countAbove',
        },
        total: {
          selector: '.chapter-img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).matches('^hwms').run(), $c.url().urlPart(4).boolean().not().run())
        .run();
    },
    getTitle($c) {
      return $c
        .title()
        .regex('^(.*?)(?=\\s*(?:\\(manga\\)|- Raw|Chapter|Online Free))', 1)
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c
        .url()
        .urlPart(3)
        .regex('^hwms-(.*?)(?:-(?:manga|raw)){0,2}\\.html$', 1)
        .trim()
        .run();
    },
    getImage($c) {
      return $c.querySelector('.thumbnail').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h3').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#list-chapter tr').run();
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
