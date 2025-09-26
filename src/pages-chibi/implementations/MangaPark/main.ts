import { PageInterface } from '../../pageInterface';

export const MangaPark: PageInterface = {
  name: 'MangaPark',
  domain: [
    'https://mangapark.to',
    'https://comicpark.org',
    'https://readpark.org',
    'https://parkmanga.com',
    'https://mpark.to',
  ],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: [
      '*://mangapark.net/*',
      '*://mangapark.com/*',
      '*://mangapark.org/*',
      '*://mangapark.to/*',
      '*://mangapark.io/*',
      '*://mangapark.me/*',
      '*://comicpark.org/*',
      '*://comicpark.to/*',
      '*://readpark.org/*',
      '*://readpark.net/*',
      '*://parkmanga.com/*',
      '*://parkmanga.net/*',
      '*://parkmanga.org/*',
      '*://mpark.to/*',
      '*://mangaparkmirrors.pages.dev/*',
    ],
  },
  search: 'https://mangapark.net/search?word={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('title').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h3 > a[href*="/title/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('h3 > a[href*="/title/"]').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('(chapter|ch)(-|.)(\\d+)', 3).number().ifNotReturn().run();
    },
    getVolume($c) {
      return $c.url().urlPart(5).regex('(volume|vol)(-|.)(\\d+)', 3).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelectorAll('.btn[href*="/title/"]')
        .filter($item => $item.text().trim().contains('Next').run())
        .first()
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: '[href^="?page="].btn-outline',
        current: {
          selector: '[href^="?page="].btn-outline',
          mode: 'text',
        },
        total: {
          selector: '[href^="?page="]:last-of-type',
          mode: 'text',
        },
      },
      {
        current: {
          selector: '[data-name="image-item"] img',
          mode: 'countAbove',
        },
        total: {
          selector: '[data-name="image-item"]:first-child [data-name="image-show"]',
          mode: 'attr',
          attribute: 'style',
          regex: '(\\d+)<\\/text>',
          group: 1,
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('title').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('main h3 a[href^="/title/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('div[data-name="chapter-list"]').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div[data-name="chapter-list"] a[href^="/title/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.target().this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .querySelector('div[data-name="chapter-list"] button.btn-primary.whitespace-normal')
            .ifThen($el => $el.text().run())
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
