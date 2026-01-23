import { PageInterface } from '../../pageInterface';

export const Kagane: PageInterface = {
  name: 'Kagane',
  domain: 'https://kagane.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://kagane.org/*'],
  },
  search: 'https://kagane.org/search?name={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(6).boolean().run(), $c.url().urlPart(5).equals('reader').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('title').text().split('- Chapter').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href^="/series/"]:not([href*="/reader/"])')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.querySelector('title').text().regex(ChRegex, 1).number().run();
    },
    getVolume($c) {
      return $c
        .querySelector('meta[name="description"]')
        .getAttribute('content')
        .regex('Volume\\s+(\\d+)', 1)
        .number()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.relative[aria-valuenow]',
          mode: 'attr',
          attribute: 'aria-valuenow',
        },
        total: {
          selector: '.relative[aria-valuenow]',
          mode: 'attr',
          attribute: 'aria-valuemax',
        },
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
      return $c.querySelector('h1').text().replaceLinebreaks().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .string('https://api.kagane.org/api/v1/series/<identifier>/thumbnail')
        .replace('<identifier>', $c.this('overview.getIdentifier').run())
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.container > .space-y-3').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.divide-y > div').run();
    },
    elementEp($c) {
      return $c.find('h3').text().regex(ChRegex, 1).number().run();
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
    listChange($c) {
      return $c
        .detectChanges($c.querySelector('.divide-y').ifNotReturn().text().run(), $c.trigger().run())
        .run();
    },
  },
};
const ChRegex =
  '(?:Ch\\.|Chapter|Ep\\.|Episode|Round)[^\\d]*(\\d+)(?!.*(?:Ch\\.|Chapter|Ep\\.|Episode|Round)[^\\d]*\\d+)';
