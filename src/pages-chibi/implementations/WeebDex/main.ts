import { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const WeebDex: PageInterface = {
  name: 'WeebDex',
  domain: 'https://weebdex.org/',
  languages: ['Many'],
  type: 'manga',
  urls: {
    match: ['*://weebdex.org/*'],
  },
  search: 'https://weebdex.org/search?title={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('chapter').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return getJsonData($c).get('manga_title').run();
    },
    getIdentifier($c) {
      return getJsonData($c).get('manga_id').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/title/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return getJsonData($c).get('chapter').ifNotReturn($c.number(1).run()).number().run();
    },
    getVolume($c) {
      return getJsonData($c).get('volume').number().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: getJsonData($c).get('links').get('mal').number().ifNotReturn().run(),
          anilistId: getJsonData($c).get('links').get('al').number().ifNotReturn().run(),
          kitsuId: getJsonData($c).get('links').get('kt').number().ifNotReturn().run(),
        })
        .run();
    },
    readerConfig: [
      {
        current: $c => getChapterProgressText($c).regex('(\\d+)\\s*/', 1).number().run(),
        total: $c => getChapterProgressText($c).regex('/\\s*(\\d+)', 1).number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('title').run();
    },
    getTitle($c) {
      return $c.querySelector('h1.font-bold').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('.space-y-5 img[src*="/covers/"]')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector('a[href*="myanimelist"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          anilistUrl: $c
            .querySelector('a[href*="anilist"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          // Weebdex uses old kitsu domain
          kitsuId: $c
            .querySelector('a[href*="kitsu"]')
            .ifNotReturn()
            .getAttribute('href')
            .urlPart(4)
            .run(),
        })
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('[data-slot="breadcrumb"]').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[data-slot="collapsible"]  a[href^="/chapter/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('title').regex('Ch\\.?\\s*?(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectChanges($c.url().urlPart(4).run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    listChange($c) {
      return $c.detectChanges($c.this('list.elementsSelector').run(), $c.trigger().run()).run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#chapter-data').ifNotReturn().text().jsonParse();
}

function getChapterProgressText($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[data-slot="select-trigger"] > span')
    .arrayFind($item => $item.text().trim().matches('\\d+ ?\\/ ?\\d+').run())
    .ifNotReturn()
    .text()
    .trim();
}
