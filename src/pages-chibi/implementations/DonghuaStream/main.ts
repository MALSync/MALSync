import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const DonghuaStream: PageInterface = {
  name: 'DonghuaStream',
  type: 'anime',
  domain: 'https://donghuastream.org',
  languages: ['English'],
  urls: {
    match: ['*://donghuastream.org/*'],
  },
  search: 'https://donghuastream.org/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).matches('-episode-').run(),
          $c.querySelector('.megavid').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[itemprop="item"][href*="/anime/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[itemprop="item"][href*="/anime/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('h1.entry-title')
        .text()
        .regex('Episode\\s+([\\d.]+)', 1, 'i')
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[rel="next"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.querySelector('.eplister').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.infox h1.entry-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('.ime img').getAttribute('data-src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.infox h1.entry-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.eplister li').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.epl-num').text().regex('([\\d.]+)', 1).number().run();
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
