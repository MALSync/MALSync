import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const Comix: PageInterface = {
  name: 'Comix',
  type: 'manga',
  domain: 'https://comix.to',
  languages: ['English'],
  urls: {
    match: ['*://comix.to/*'],
  },
  search: 'https://comix.to/browse?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return getJsonData($c).get('page').equals('chapter').run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('manga_id').run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('manga_url').ifNotReturn().string().urlAbsolute().run();
    },
    getEpisode($c) {
      return getJsonData($c).get('number').number().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: getJsonData($c).get('mal_id').number().ifNotReturn().run(),
          anilistId: getJsonData($c).get('anilist_id').number().ifNotReturn().run(),
        })
        .run();
    },
    readerConfig: [
      {
        current: $c =>
          $c
            .querySelectorAll('.rpage-progress__seg.is-visited, .rpage-progress__seg.is-active')
            .length()
            .run(),
        total: $c => $c.querySelectorAll('.rpage-progress__seg').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return getJsonData($c).get('page').equals('overview').run();
    },
    getTitle($c) {
      return getJsonData($c).get('name').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('manga_id').run();
    },
    getImage($c) {
      return $c.querySelector('.mpage__poster img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.mpage__desc-wrap').uiBefore().run();
    },
    getMalUrl($c) {
      return $c.provider().this('sync.getMalUrl').run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.mchap-list > .mchap-item').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('a').text().regex('ch\\.(\\d+)', 1).number().run();
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
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('.mpage__desc-wrap').boolean().run())
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.mchap-foot__hint').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#syncData').ifNotReturn().text().jsonParse();
}
