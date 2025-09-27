import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const Animecix: PageInterface = {
  name: 'Animecix',
  type: 'anime',
  domain: 'https://animecix.tv',
  languages: ['Turkish'],
  urls: {
    match: ['*://*.animecix.tv/*', '*://*.animecix.com/*', '*://*.animecix.net/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().contains('/titles/').run(),
          $c.url().contains('/season/').run(),
          $c.url().contains('/episode/').run(),
        )
        .run();
    },
    getTitle($c) {
      return getStructuredData($c).get('name').ifNotReturn().string().trim().run();
    },
    getIdentifier($c) {
      return $c
        .if(
          $c.url().contains('/season/').run(),
          $c
            .string('<identifier>?season=<season>')
            .replace('<identifier>', $c.url().urlPart(5).run())
            .replace('<season>', $c.url().urlPart(7).run())
            .run(),
          $c.url().urlPart(5).run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('h1.t-title a[href*="/titles/"]:not([href*="/season/"])')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(9).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[href*="/episode/"].next-episode, a[title*="Sonraki"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().contains('/titles/').run(),
          $c.url().contains('/season/').not().run(),
          $c.url().contains('/episode/').not().run(),
        )
        .run();
    },
    getTitle($c) {
      return getStructuredData($c).get('name').ifNotReturn().string().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getImage($c) {
      return $c
        .querySelector('.poster img, title-header img')
        .ifNotReturn()
        .getAttribute('src')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c
        .querySelector('.t-main-container, .title-header, h1.t-title')
        .ifNotReturn()
        .uiAfter()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll("title-episodes a[href*='/season/'][href*='/episode/']").run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .closest('.episode-card-container')
        .find('.number')
        .text()
        .regex('(\d+)', 1)
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .waitUntilTrue($c.querySelector('h1.t-title').boolean().run())
        .trigger()
        .detectURLChanges($c.trigger().run())
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.url().contains('/season/').run(),
              $c.url().contains('/episode/').run(),
              $c.querySelector('h1.t-title').boolean().run(),
              $c.querySelector('.episode-details, .episode-info, .video-meta, .episode-title').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('h1.t-title').boolean().run(),
              $c.querySelector('title-episodes').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};

function getStructuredData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('script[type="application/ld+json"]')
    .ifNotReturn()
    .text()
    .jsonParse();
}
