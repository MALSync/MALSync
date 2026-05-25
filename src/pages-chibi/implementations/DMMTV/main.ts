import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

const domain = 'https://tv.dmm.com';

function seasonMarkerPattern() {
  return '^(\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|\\u7b2c\\d+\\u671f|\\u30b7\\u30fc\\u30ba\\u30f3\\s*\\d+)$';
}

function selectedSeasonTitlePattern() {
  return '^(.+(?:\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|\\u7b2c\\d+\\u671f|\\u30b7\\u30fc\\u30ba\\u30f3\\s*\\d+).*)$';
}

function duplicatedDmmTitlePattern() {
  return '^(.+?[\\uFF5E\\u301C].+?[\\uFF5E\\u301C])\\s+.+$';
}

function ignoredDmmTitlePattern() {
  return '^(?:\\u30d3\\u30c7\\u30aa\\u306e\\u4e00\\u81f4|\\u3042\\u306a\\u305f\\u306b\\u304a\\u3059\\u3059\\u3081\\u306e\\u4f5c\\u54c1|\\u5168\\u4f5c\\u54c1\\u4e00\\u89a7|\\d{4}\\u5e74.+\\u30a2\\u30cb\\u30e1\\u914d\\u4fe1\\u30ab\\u30ec\\u30f3\\u30c0\\u30fc)$';
}

function digitEpisodePattern() {
  return '(?:\\u7b2c|#|Episode)\\s*(\\d+)(?:\\u8a71)?';
}

function japaneseEpisodePattern() {
  return '\\u7b2c\\s*([\\u96f6\\u3007\\u4e00\\u4e8c\\u4e09\\u56db\\u4e94\\u516d\\u4e03\\u516b\\u4e5d\\u5341\\u767e\\u5343\\u4e07\\u5104\\u5146]+)\\s*\\u8a71';
}

function titleEpisodePattern() {
  return `(?:${digitEpisodePattern()}|${japaneseEpisodePattern()})`;
}

function missing($c: ChibiGenerator<unknown>) {
  return $c.object({}).get('missing').run();
}

function cleanDmmTitle($c: ChibiGenerator<string>) {
  return $c.replaceRegex(duplicatedDmmTitlePattern(), '$1').trim();
}

function hasValidDetailTitle($c: ChibiGenerator<unknown>) {
  return $c
    .and(
      $c.querySelector('#detail-header h1').boolean().run(),
      $c
        .querySelector('#detail-header h1')
        .text()
        .trim()
        .matches(ignoredDmmTitlePattern())
        .not()
        .run(),
    )
    .run();
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
      missing($c),
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

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('TVSeries').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}

function detailTitle($c: ChibiGenerator<unknown>) {
  return $c
    .coalesce(
      $c.fn($c.querySelector('#detail-header h1').ifNotReturn().text().trim().run()).run(),
      $c.fn(getJsonData($c).get('name').string().trim().run()).run(),
      $c.fn(pageTitle($c).run()).run(),
    )
    .ifNotReturn();
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
      $c
        .querySelector('#detail-header h1')
        .text()
        .trim()
        .concat(' ')
        .concat(selectedSeasonLabel($c).run())
        .replaceRegex(duplicatedDmmTitlePattern(), '$1')
        .trim()
        .run(),
      missing($c),
    )
    .run();
}

function episodeNumber($c: ChibiGenerator<string>) {
  return $c
    .coalesce(
      $c
        .if(
          $c.matches(digitEpisodePattern()).run(),
          $c.regex(digitEpisodePattern(), 1).number().run(),
          missing($c),
        )
        .run(),
      $c
        .if(
          $c.matches(japaneseEpisodePattern()).run(),
          $c.regex(japaneseEpisodePattern(), 1).JPtoNumeral().number().run(),
          missing($c),
        )
        .run(),
    )
    .ifNotReturn();
}

function isEpisodeText($c: ChibiGenerator<string>) {
  return $c
    .or($c.matches(digitEpisodePattern()).run(), $c.matches(japaneseEpisodePattern()).run())
    .run();
}

function isAnimeDetail($c: ChibiGenerator<unknown>) {
  return $c
    .and(
      $c.querySelector('#detail-header').boolean().run(),
      hasValidDetailTitle($c),
      $c
        .or(
          pageTitle($c).matches('\\u30a2\\u30cb\\u30e1/\\d{4}\\u5e74').run(),
          $c
            .querySelectorAll('main a[href*="/vod/list/?categories="]')
            .arrayFind($el => $el.text().trim().matches('^\\u30a2\\u30cb\\u30e1$').run())
            .boolean()
            .run(),
        )
        .run(),
    )
    .run();
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
        .and(
          $c.url().urlPart(3).equals('vod').run(),
          $c.url().urlPart(4).equals('playback').run(),
          $c.url().urlParam('season').boolean().run(),
          $c.url().urlParam('content').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return detailTitle($c)
        .replaceRegex(`\\s+${titleEpisodePattern()}.*$`, '')
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
      return episodeNumber(pageTitle($c)).run();
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
          selectedSeasonTitle($c),
          titleWithSeasonLabel($c),
          cleanDmmTitle(getJsonData($c).get('name').string().trim()).run(),
          cleanDmmTitle($c.querySelector('#detail-header h1').text().trim()).run(),
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
        .filter($el => $el.text().matches(digitEpisodePattern()).run())
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute(domain).run();
    },
    elementEp($c) {
      return $c.text().regex(digitEpisodePattern(), 1).ifNotReturn().number().run();
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
              $c.querySelector('#detail-header h1').boolean().run(),
              $c.querySelector('#detail-header').boolean().run(),
              hasValidDetailTitle($c),
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
              isEpisodeText(pageTitle($c)),
              $c.this('sync.getTitle').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
