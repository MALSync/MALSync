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
  search: 'https://comix.to/browser?keyword={searchtermPlus}',
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
    getImage($c) {
      return $c.querySelector('[itemprop="image"]').getAttribute('src').ifNotReturn().run();
    },
    getMalUrl($c) {
      const getMalId = getJsonData($c)
        .get('mal_id')
        .number()
        .ifNotReturn()
        .string('https://myanimelist.net/manga/<identifier>')
        .replace('<identifier>', getJsonData($c).get('mal_id').run())
        .run();

      const getAnilistId = getJsonData($c)
        .get('al_id')
        .number()
        .ifNotReturn()
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .string('https://anilist.co/manga/<identifier>')
        .replace('<identifier>', getJsonData($c).get('al_id').run())
        .run();

      return $c.coalesce($c.fn(getMalId).run(), $c.fn(getAnilistId).run()).ifNotReturn().run();
    },
    readerConfig: [
      {
        current: {
          selector: '.progress-line > span.p, .progress-line > span.c',
          mode: 'count',
        },
        total: {
          selector: '.progress-line > span',
          mode: 'count',
        },
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
      return $c.querySelector('[itemprop="image"]').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.description').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chap-list > li:not(.head)').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('a b').text().regex('ch\\. (\\d+)', 1).number().run();
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
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.chap-list > li:not(.head)').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#syncData').ifNotReturn().text().jsonParse();
}
