import { PageInterface } from '../../pageInterface';

export const Kagane: PageInterface = {
  name: 'Kagane',
  domain: 'https://kagane.to',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://kagane.to/*', '*://kagane.org/*'],
  },
  search: 'https://kagane.to/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(6).boolean().run(), $c.url().urlPart(5).equals('reader').run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[property="og:image:alt"]')
        .ifNotReturn()
        .getAttribute('content')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('/reader.*', '').urlAbsolute().run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .replaceRegex('/compressed.*', '')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('[property="og:title"]')
        .getAttribute('content')
        .regexAutoGroup(ChRegex)
        .ifNotReturn()
        .number()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('[property="og:title"]')
        .getAttribute('content')
        .regexAutoGroup(VolRegex)
        .ifNotReturn()
        .number()
        .run();
    },
    readerConfig: [
      {
        current: $c =>
          $c
            .querySelector('[role="progressbar"][aria-valuenow]')
            .getAttribute('aria-valuenow')
            .number()
            .run(),
        total: $c =>
          $c
            .querySelector('[role="progressbar"][aria-valuenow]')
            .getAttribute('aria-valuemax')
            .number()
            .run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().not().run(), $c.url().urlPart(3).equals('series').run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[property="og:title"]')
        .getAttribute('content')
        .ifNotReturn()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('button[class*="aspect-"] img')
        .ifNotReturn()
        .getAttribute('src')
        .replaceRegex('/compressed.*', '')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div[id^="chapter-"]').run();
    },
    elementUrl($c) {
      return $c.find('a[href*="/reader/"]').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      // the label ("Ch. 12") is localized, so only take the number
      return $c.find('span.font-semibold').text().regex('(\\d+(?:\\.\\d+)?)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.reader-page').boolean().run()).trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('h1').boolean().run()).trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelectorAll('div[id^="chapter-"]').length().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

const ChRegex = '(?:Ch\\.|Chapter|Ep\\.|Episode|Round)\\s*(\\d+)|(\\d+)\\.';
const VolRegex = '(?:Vol\\.|Volume)\\s*(\\d+)';
