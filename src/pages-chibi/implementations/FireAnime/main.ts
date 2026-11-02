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
      // To handle every season separately
      return getJsonData($c).get('title').run();
    },
    getOverviewUrl($c) {
      // /anime/<slug>/watch/<season>/<ep> -> /anime/<slug>/season/<season>
      // /anime/<slug>/group/<group>/watch/<season>/<ep> -> /anime/<slug>/group/<group>
      return getJsonData($c)
        .get('url')
        .ifNotReturn()
        .string()
        .replaceRegex('(/group/[^/?#]+)/watch/[^?#]*', '$1')
        .replaceRegex('/watch/([^/?#]+)/[^/?#]+/?', '/season/$1')
        .urlAbsolute()
        .run();
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
      return $c
        .providerUrlUtility({
          anilistId: getJsonData($c).get('anilist_id').run(),
        })
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
      return getJsonData($c).get('title').run();
    },
    uiInjection($c) {
      return $c
        .querySelector('#malsync-anchor')
        .ifThen($c => $c.uiAppend().return().run())
        .querySelector('h1')
        .uiAfter()
        .run();
    },
    getImage($c) {
      return getJsonData($c).get('image_url').ifNotReturn().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          anilistId: getJsonData($c).get('anilist_id').run(),
        })
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().detectChanges(getJsonData($c).run(), $c.trigger().run()).trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('#playerObject').boolean().run()).trigger().run();
    },
    overviewIsReady($c) {
      // Group pages (/anime/<slug>/group/<group>) have no #malsync-anchor
      return $c
        .waitUntilTrue(
          $c
            .or(
              $c.querySelector('#malsync-anchor').boolean().run(),
              $c
                .and($c.url().contains('/group/').run(), $c.querySelector('h1').boolean().run())
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#malsync').ifNotReturn().text().jsonParse();
}
