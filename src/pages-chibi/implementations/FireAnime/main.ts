import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const FireAnime: PageInterface = {
  name: 'FireAnime',
  type: 'anime',
  domain: 'https://fireani.me',
  languages: ['German', 'English'],
  urls: {
    match: ['*://fireani.me/*'],
  },
  search: 'https://fireani.me/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return getJsonData($c).get('episode_nr').ifNotReturn().run();
    },
    getTitle($c) {
      return getJsonData($c).get('title').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('slug').run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('url').ifNotReturn().string().urlAbsolute().run();
    },
    getEpisode($c) {
      return getJsonData($c).get('episode_nr').number().run();
    },
    getImage($c) {
      return getJsonData($c).get('image_url').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('#malsync-anchor').uiAppend().run();
    },
    getMalUrl($c) {
      return getJsonData($c)
        .get('anilist_id')
        .number()
        .ifNotReturn()
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .string('https://anilist.co/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('anilist_id').run())
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return getJsonData($c).get('episode_nr').isNil().run();
    },
    getTitle($c) {
      return getJsonData($c).get('title').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('slug').run();
    },
    uiInjection($c) {
      return $c.querySelector('#malsync-anchor').uiAppend().run();
    },
    getImage($c) {
      return getJsonData($c).get('image_url').ifNotReturn().run();
    },
    getMalUrl($c) {
      return getJsonData($c)
        .get('anilist_id')
        .number()
        .ifNotReturn()
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .string('https://anilist.co/anime/<identifier>')
        .replace('<identifier>', getJsonData($c).get('anilist_id').run())
        .run();
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
          $c.querySelector('#malsync').ifNotReturn().text().trim().run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c.querySelector('#playerObject iframe, #playerObject media-player').run();
    },
    overviewIsReady($c) {
      return $c.querySelector('#malsync-anchor, h1').run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#malsync').ifNotReturn().text().jsonParse();
}
