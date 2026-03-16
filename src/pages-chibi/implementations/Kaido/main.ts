import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const Kaido: PageInterface = {
  name: 'Kaido',
  type: 'anime',
  domain: 'https://kaido.to',
  languages: ['English'],
  urls: {
    match: ['*://kaido.to/*'],
  },
  search: 'https://kaido.to/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return getJsonData($c).get('page').equals('episode').run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('anime_id').run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('series_url').ifNotReturn().string().replace('watch/', '').run();
    },
    getEpisode($c) {
      return getJsonData($c).get('episode').number().run();
    },
    nextEpUrl($c) {
      return getJsonData($c).get('next_episode_url').ifNotReturn().run();
    },
    getMalUrl($c) {
      const getMalId = getJsonData($c)
        .get('mal_id')
        .number()
        .ifNotReturn()
        .string('https://myanimelist.net/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('mal_id').run())
        .run();

      const getAnilistId = getJsonData($c)
        .get('anilist_id')
        .number()
        .ifNotReturn()
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .string('https://anilist.co/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('anilist_id').run())
        .run();

      return $c.coalesce($c.fn(getMalId).run(), $c.fn(getAnilistId).run()).ifNotReturn().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return getJsonData($c).get('page').equals('anime').run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('anime_id').run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c
        .querySelector(getJsonData($c).get('selector_position').run())
        .uiAppend()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.ss-list > a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('data-number').number().run();
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
        .contains('://')
        .ifNotReturn($c.trigger().return().run())
        .run();
    },
    overviewIsReady($c) {
      return $c
        .querySelector('#syncData')
        .ifNotReturn()
        .text()
        .contains('://')
        .ifNotReturn($c.trigger().return().run())
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#syncData').ifNotReturn().text().jsonParse();
}
