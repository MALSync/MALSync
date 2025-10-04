import { PageInterface } from '../../pageInterface';

export const ZeroScans: PageInterface = {
  name: 'ZeroScans',
  domain: 'https://zscans.com/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://zscans.com/*', '*://zeroscans.com/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('comics').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.nuxt-link-active[style]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.nuxt-link-active[style]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.d-flex a:nth-child(5)')
        .text()
        .regex('Chapter[ _-]?(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.d-flex a:nth-child(6)').getAttribute('href').urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: '.hooper-navigation + .hooper-liveregion',
        current: {
          selector: '.hooper-navigation + .hooper-liveregion',
          mode: 'text',
          regex: '(\\d+) of (\\d+)$',
          group: 1,
        },
        total: {
          selector: '.hooper-navigation + .hooper-liveregion',
          mode: 'text',
          regex: '(\\d+) of (\\d+)$',
          group: 2,
        },
      },
      {
        current: {
          selector: '.group .v-image__image',
          mode: 'countAbove',
        },
        total: {
          selector: '.group .v-image__image',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('comics').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.v-card__title.text-h4').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.v-card__text.pt-0').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.row.pa-4 .col-md-6 a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('span.font-weight-bold').text().trim().number().run();
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
