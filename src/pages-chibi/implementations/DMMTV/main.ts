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
              $c.url().urlPart(4).equals('detail').run(),
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
        .replaceRegex('\\s+(?:第\\d+話|#\\d+).*$', '')
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
      return pageTitle($c).regex('(?:第|#)\\s*(\\d+)(?:話)?', 1).number().run();
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
          isAnimeDetail($c),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          titleWithSeasonLabel($c),
          selectedSeasonTitle($c),
          $c
            .querySelector('#detail-header span.mr-2')
            .text()
            .trim()
            .regex(
              '^(.+(?:\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|第\\d+期|シーズン\\s*\\d+).*)$',
              1,
            )
            .run(),
          $c.querySelector('h1').text().trim().run(),
          getJsonData($c).get('name').string().trim().run(),
        )
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
      return $c.querySelectorAll('a[href*="content="]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute(domain).run();
    },
    elementEp($c) {
      return $c.text().regex('(?:第|#)\\s*(\\d+)(?:話)?', 1).number().run();
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
        .detectChanges($c.querySelector('#detail-header').text().run(), $c.trigger().run())
        .detectChanges(
          $c.querySelector('main a[href*="/vod/list/?categories="]').text().run(),
          $c.trigger().run(),
        )
        .domReady()
        .trigger()
        .run();
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

function titleWithSeasonLabel($c: ChibiGenerator<unknown>) {
  return $c
    .if(
      seasonLabel($c).boolean().run(),
      $c.querySelector('h1').text().trim().concat(' ').concat(seasonLabel($c).run()).run(),
      $c.object({}).get('missing').run(),
    )
    .run();
}

function selectedSeasonTitle($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('#detail-header span.mr-2')
    .text()
    .trim()
    .normalize()
    .replaceRegex('([Ss]eason)\\s*(\\d+)', '$1 $2')
    .regex(
      '^(.+(?:\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|\\u7b2c\\d+\\u671f|\\u30b7\\u30fc\\u30ba\\u30f3\\s*\\d+).*)$',
      1,
    )
    .run();
}

function seasonLabel($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('#detail-header span.mr-2')
    .text()
    .trim()
    .normalize()
    .replaceRegex('^([Ss]eason)\\s*(\\d+)$', '$1 $2')
    .regex(
      '^(\\d+(?:st|nd|rd|th)\\s+[Ss]eason|[Ss]eason\\s*\\d+|\\u7b2c\\d+\\u671f|\\u30b7\\u30fc\\u30ba\\u30f3\\s*\\d+)$',
      1,
    );
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
