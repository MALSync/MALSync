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
      return $c.querySelector('meta[name="series-title"]').getAttribute('content').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('/reader.*', '').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .querySelector('meta[name="chapter-title"]')
            .getAttribute('content')
            .regexAutoGroup(ChRegex)
            .run(),
          $c.querySelector('meta[name="chapter-number"]').getAttribute('content').run(),
        )
        .number()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('meta[name="volume-number"]')
        .getAttribute('content')
        .ifNotReturn()
        .number()
        .run();
    },
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
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('.relative img[alt=""]')
        .getAttribute('src')
        .ifNotReturn()
        .replaceRegex('/compressed.*', '')
        .urlAbsolute()
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
    elementsSelector($c) {
      return $c.querySelector('.space-y-3').ifNotReturn().findAll('.grid > div').run();
    },
    elementEp($c) {
      return $c
        .coalesce(
          // have to put each regexAutoGroup because sometime h4 doesn't provide chapter number for fallback reason.
          $c.target().find('h4').text().regexAutoGroup(ChRegex).run(),
          $c.target().find('.font-bold').text().regexAutoGroup(ChRegex).run(),
        )
        .number()
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
          $c.querySelector('.space-y-3').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
const ChRegex = '(?:Ch\\.|Chapter|Ep\\.|Episode|Round)\\s*(\\d+)|(\\d+)\\.';
