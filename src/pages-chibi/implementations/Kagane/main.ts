import { PageInterface } from '../../pageInterface';

export const Kagane: PageInterface = {
  name: 'Kagane',
  domain: 'https://kagane.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://kagane.org/*'],
  },
  search: 'https://kagane.org/search?q={searchtermPlus}',
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
      return $c.querySelector('title').text().regexAutoGroup(ChRegex).number().run();

      /* Fix that only work on next release because of calculate function needed
      return $c
        .coalesceFn(
          $c

            .querySelector('a[title*="Previous:"]')
            .getAttribute('title')
            .regexAutoGroup(ChRegex)
            .number()
            .calculate('+', 1)
            .run(),
          $c.querySelector('title').text().regexAutoGroup(ChRegex).run(),
        )
        .number()
        .run();
      */
    },
    /* Cannot find any DOM that reliably provide volume anymore.
    getVolume($c) {
      return $c
        .querySelector('meta[name="description"]')
        .getAttribute('content')
        .regex('Volume\\s+(\\d+)', 1)
        .number()
        .run();
    },
    */
    readerConfig: [
      {
        current: $c =>
          $c.querySelector('.relative[aria-valuenow]').getAttribute('aria-valuenow').number().run(),
        total: $c =>
          $c.querySelector('.relative[aria-valuenow]').getAttribute('aria-valuemax').number().run(),
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
      return $c.querySelector('h1').ifNotReturn().text().replaceLinebreaks().run();
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
      return $c
        .querySelector('a[class*=text-primary] h1')
        .closest('.items-baseline')
        .parent()
        .uiAfter()
        .run();
    },
  },
  list: {
    // Is it okay to make it list in chapter page too?
    elementsSelector($c) {
      return $c
        .coalesce(
          $c.fn($c.querySelector('.space-y-3').ifNotReturn().findAll('.grid > div').run()).run(),
          $c.querySelectorAll('.space-y-0\\.5 a > div').run(),
        )
        .ifNotReturn()
        .run();
    },
    elementEp($c) {
      return $c
        .coalesce($c.target().find('h4').run(), $c.target().find('p').run())
        .text()
        .regexAutoGroup(ChRegex)
        .number()
        .log()
        .run();
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
        .detectChanges(
          $c
            .coalesce(
              $c.querySelector('.space-y-3').run(),
              $c.querySelector('.space-y-0\\.5').run(),
            )
            .ifNotReturn()
            .text()
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
const ChRegex = '(?:Ch\\.|Chapter|Ep\\.|Episode|Round)\\s*(\\d+)|(\\d+)\\.';
