import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const ComicDays: PageInterface = {
  name: 'ComicDays',
  type: 'manga',
  domain: 'https://comic-days.com',
  languages: ['Japanese'],
  urls: {
    match: ['*://comic-days.com/*'],
  },
  search: 'https://comic-days.com/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return getJsonData($c).get('episode_title').boolean().run();
    },
    getTitle($c) {
      return getJsonData($c).get('series_title').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('series_id').run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },
    getEpisode($c) {
      return getJsonData($c)
        .get('episode_title')
        .type<string>()
        .toHalfWidth()
        .regex('(\\d+)', 1)
        .number()
        .run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.series-header-description').uiAfter().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('[class*="current-readable-product"]')
        .prev()
        .ifNotReturn()
        .find('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[class*="series-episode-list--"] li').log().run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn($c.url().run()).urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('img').getAttribute('alt').toHalfWidth().regex('(\\d+)').number().run();
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
      return $c.waitUntilTrue($c.querySelector('.loading-text').isNil().run()).trigger().run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('html[data-media]')
    .getAttribute('data-gtm-data-layer')
    .ifNotReturn()
    .jsonParse()
    .get('episode');
}
