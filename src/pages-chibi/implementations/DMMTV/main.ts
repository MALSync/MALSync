import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

const domain = 'https://tv.dmm.com';

export const DMMTV: PageInterface = {
  name: 'DMM TV',
  domain,
  languages: ['Japanese'],
  type: 'anime',
  urls: {
    match: ['*://tv.dmm.com/vod/*'],
  },
  search: 'https://tv.dmm.com/vod/search/?keyword={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('vod').run(),
          $c.url().urlPart(4).equals('playback').run(),
          $c.url().urlParam('season').boolean().run(),
          $c.url().urlParam('content').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return pageTitle($c)
        .replaceRegex('\\s+第\\d+話.*$', '')
        .replaceRegex('\\s+\\(アニメ/\\d{4}年\\).*$', '')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlParam('season').string().run();
    },
    getOverviewUrl($c) {
      return $c
        .string(`${domain}/vod/detail/?season=`)
        .concat($c.this('sync.getIdentifier').run())
        .run();
    },
    getEpisode($c) {
      return pageTitle($c).regex('第(\\d+)話', 1).number().run();
    },
    uiInjection($c) {
      return $c.querySelector('body').uiAppend().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('vod').run(),
          $c.url().urlPart(4).equals('detail').run(),
          $c.url().urlParam('season').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').string().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlParam('season').string().run();
    },
    uiInjection($c) {
      return $c.querySelector('#detail-header').ifNotReturn().uiAfter().run();
    },
    getImage($c) {
      return getJsonData($c).get('image').string().ifNotReturn().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href*="content="]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute(domain).run();
    },
    elementEp($c) {
      return $c.text().regex('第(\\d+)話', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectChanges($c.title().run(), $c.trigger().run()).domReady().trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('h1').boolean().run()).trigger().run();
    },
    listChange($c) {
      return $c.detectChanges($c.querySelector('main').text().run(), $c.trigger().run()).run();
    },
  },
};

function pageTitle($c: ChibiGenerator<unknown>) {
  return $c.title().split('|').first().trim();
}

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('TVSeries').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
