import type { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
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
      // Not using usual json because it doesn't update properly in some chapter
      return multiEpisode(
        $c.setVariable('epList', $c.querySelector('.episode-header-title').text().run()),
      );
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
    readerConfig: [
      {
        current: $c => $c.querySelector('.viewer-slider-pagenum-now').text().number().run(),
        total: $c => $c.querySelector('.viewer-slider-pagenum-last').text().number().run(),
      },
    ],
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[class*="series-episode-list--"] li').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn($c.url().run()).urlAbsolute().run();
    },
    elementEp($c) {
      return multiEpisode(
        $c.setVariable('epList', $c.target().find('img').getAttribute('alt').run()),
      );
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
      return $c
        .waitUntilTrue($c.querySelector('.episode-not-found-thumb').isNil().run())
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('[class*="series-episode-list--"]').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

const jpNumRegex = '([零〇一二三四五六七八九十百千万億兆]+)';
function getJsonData($c: ChibiGenerator<any>) {
  return $c
    .querySelector('html[data-media]')
    .getAttribute('data-gtm-data-layer')
    .ifNotReturn()
    .jsonParse()
    .get('episode');
}
function multiEpisode($c) {
  return $c
    .coalesce(
      $c
        .getVariable('epList')
        .string()
        .toHalfWidth()
        .regex('(\\d+)', 1)
        .ifThen($c => $c.number().run())
        .run(),
      $c
        .getVariable('epList')
        .string()
        .regex(jpNumRegex, 1)
        .ifThen($c => $c.JPtoNumeral().run())
        .run(),
    )
    .run();
}
