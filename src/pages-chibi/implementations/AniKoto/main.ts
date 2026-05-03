import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const anikoto: PageInterface = {
  name: 'AniKoto',
  domain: 'https://anikoto.cz',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.anikoto.cz/*', '*://*.anikototv.to/*'],
  },
  search: 'https://anikoto.cz/filter?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return getJsonData($c).get('page').equals('episode').run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('series_url').ifNotReturn().string().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).replaceRegex('ep-', '').number().run();
    },
    getImage($c) {
      return $c.querySelector('[itemprop="image"]').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('#controls').uiAfter().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.eplist .active')
        .parent()
        .next()
        .ifNotReturn()
        .find('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      const getMalId = getJsonData($c)
        .get('mal_id')
        .number()
        .ifNotReturn()
        .string('https://myanimelist.net/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('mal_id').run())
        .run();

      const getAnilistId = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .string('https://anilist.co/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('al_id').run())
        .run();

      return $c.coalesce($c.fn(getMalId).run(), $c.fn(getAnilistId).run()).ifNotReturn().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.eplist a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('num').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .detectChanges(
          $c.querySelector('#syncData').ifNotReturn().text().trim().run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .querySelector('#syncData')
        .ifNotReturn()
        .text()
        .contains('\\/\\/')
        .ifNotReturn($c.trigger().return().run())
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#syncData').ifNotReturn().text().jsonParse();
}
