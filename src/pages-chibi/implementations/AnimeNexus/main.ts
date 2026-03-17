import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const AnimeNexus: PageInterface = {
  name: 'AnimeNexus',
  domain: 'https://anime.nexus',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://anime.nexus/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).matches('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return getJsonData($c).get('partOfSeries').get('name').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(5).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('[property="video:series"]')
        .getAttribute('content')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return getJsonData($c).get('episodeNumber').number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[href*="episode"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('series').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getImage($c) {
      return $c.querySelector('picture img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[id*="episode"] .block').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').regex('episode-(\\d+)', 1).number().run();
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

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('episodeNumber').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
