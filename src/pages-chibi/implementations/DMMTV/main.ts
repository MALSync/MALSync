import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

const domain = 'https://tv.dmm.com';

function seasonMarkerPattern() {
  return '^(\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|\\u7b2c\\d+\\u671f|\\u30b7\\u30fc\\u30ba\\u30f3\\s*\\d+)$';
}

function selectedSeasonTitlePattern() {
  return '^(.+(?:\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|\\u7b2c\\d+\\u671f|\\u30b7\\u30fc\\u30ba\\u30f3\\s*\\d+).*)$';
}

function episodePattern() {
  return '(?:\\u7b2c|#|Episode)\\s*(\\d+)(?:\\u8a71)?';
}

function selectedSeasonLabel($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('#detail-header span.mr-2')
    .text()
    .trim()
    .normalize()
    .replaceRegex('([Ss]eason)\\s*(\\d+)', '$1 $2');
}

function isSelectedSeasonTitle($c: ChibiGenerator<unknown>) {
  return $c
    .and(
      $c.querySelector('#detail-header span.mr-2').boolean().run(),
      selectedSeasonLabel($c).matches(selectedSeasonTitlePattern()).run(),
    )
    .run();
}

function selectedSeasonTitle($c: ChibiGenerator<unknown>) {
  return $c
    .if(
      isSelectedSeasonTitle($c),
      selectedSeasonLabel($c).regex(selectedSeasonTitlePattern(), 1).run(),
      $c.object({}).get('missing').run(),
    )
    .run();
}

function isSeasonMarker($c: ChibiGenerator<unknown>) {
  return $c
    .and(
      $c.querySelector('#detail-header span.mr-2').boolean().run(),
      selectedSeasonLabel($c).matches(seasonMarkerPattern()).run(),
    )
    .run();
}

function pageTitle($c: ChibiGenerator<unknown>) {
  return $c.title().split('|').first().trim();
}

function isDetailUrl($c: ChibiGenerator<unknown>) {
  return $c
    .or(
      $c.url().urlPart(4).equals('detail').run(),
      $c
        .and($c.url().urlPart(4).equals('rated').run(), $c.url().urlPart(5).equals('detail').run())
        .run(),
    )
    .run();
}

function titleWithSeasonLabel($c: ChibiGenerator<unknown>) {
  return $c
    .if(
      isSeasonMarker($c),
      $c.querySelector('h1').text().trim().concat(' ').concat(selectedSeasonLabel($c).run()).run(),
      $c.object({}).get('missing').run(),
    )
    .run();
}

function isAnimeDetail($c: ChibiGenerator<unknown>) {
  return $c
    .or(
      pageTitle($c).matches('\\u30a2\\u30cb\\u30e1/\\d{4}\\u5e74').run(),
      $c
        .querySelectorAll('main a[href*="/vod/list/?categories="]')
        .arrayFind($el => $el.text().trim().matches('^\\u30a2\\u30cb\\u30e1$').run())
        .boolean()
        .run(),
    )
    .run();
}

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('TVSeries').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}

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
        .or(
          $c
            .and(
              $c.url().urlPart(3).equals('vod').run(),
              $c.url().urlPart(4).equals('playback').run(),
              $c.url().urlParam('season').boolean().run(),
              $c.url().urlParam('content').boolean().run(),
            )
            .run(),
          $c
            .and(
              $c.url().urlPart(3).equals('vod').run(),
              isDetailUrl($c),
              $c.url().urlParam('season').boolean().run(),
              $c.url().urlParam('content').boolean().run(),
              isAnimeDetail($c),
            )
            .run(),
        )
        .run();
    },
    getTitle($c) {
      return pageTitle($c)
        .replaceRegex('\\s+(?:第\\d+話|#\\d+|Episode\\s*\\d+).*$', '')
        .replaceRegex('\\s+\\(アニメ/\\d{4}年\\).*$', '')
        .trim()
        .ifNotReturn()
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
      return pageTitle($c).regex(episodePattern(), 1).ifNotReturn().number().run();
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
          isDetailUrl($c),
          $c.url().urlParam('season').boolean().run(),
          isAnimeDetail($c),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          titleWithSeasonLabel($c),
          selectedSeasonTitle($c),
          $c.querySelector('h1').text().trim().run(),
          getJsonData($c).get('name').string().trim().run(),
        )
        .ifNotReturn()
        .run();
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
      return $c
        .querySelectorAll(
          'a[href*="/vod/detail/?season="][href*="content="], a[href*="/vod/rated/detail/?season="][href*="content="]',
        )
        .filter($el => $el.text().matches(episodePattern()).run())
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute(domain).run();
    },
    elementEp($c) {
      return $c.text().regex(episodePattern(), 1).ifNotReturn().number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectURLChanges($c.trigger().run(), { ignoreQuery: false, ignoreAnchor: true })
        .detectChanges($c.title().run(), $c.trigger().run())
        .detectChanges(
          $c.querySelectorAll('#detail-header h1, #detail-header span.mr-2').length().run(),
          $c.trigger().run(),
        )
        .detectChanges(
          $c.querySelectorAll('main a[href*="/vod/list/?categories="]').length().run(),
          $c.trigger().run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('h1').boolean().run(),
              $c.this('overview.getTitle').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.url().urlParam('season').boolean().run(),
              pageTitle($c).matches(episodePattern()).run(),
              $c.this('sync.getTitle').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
