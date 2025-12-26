import { PageInterface } from '../../pageInterface';

export const Rawkuma: PageInterface = {
  name: 'Rawkuma',
  domain: 'https://rawkuma.net',
  languages: ['Japanese'],
  type: 'manga',
  urls: {
    match: ['*://rawkuma.com/*', '*://rawkuma.net/*'],
  },
  search: 'https://rawkuma.net/library/?search_term={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.wp-post-image[alt]').getAttribute('alt').ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c
        .url()
        .urlPart(5)
        .ifNotReturn()
        .regex('chapter[^\\d]?(\\d+)', 1, 'i')
        .ifNotReturn()
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('[aria-label="Next"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '[data-image-data] img',
          mode: 'countAbove',
        },
        total: {
          selector: '[data-image-data] img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('[itemprop="image"] img')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1[itemprop="name"]').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapter-list [data-chapter-number]').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn().run();
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
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('#chapter-list').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
