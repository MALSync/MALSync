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
      return getJsonData($c).get('chapter').number().run();
    },
    getVolume($c) {
      return getJsonData($c).get('volume').number().run();
    },
    getMalUrl($c) {
      const getMal = $c
        .getVariable('malId')
        .ifNotReturn()
        .string('https://myanimelist.net/manga/<identifier>')
        .replace('<identifier>', $c.getVariable('malId').run())
        .run();

      const getAnilist = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .getVariable('anilistId')
        .ifNotReturn()
        .string('https://anilist.co/manga/<identifier>')
        .replace('<identifier>', $c.getVariable('anilistId').run())
        .run();

      const getKitsu = $c
        .provider()
        .equals('KITSU')
        .ifNotReturn()
        .getVariable('kitsuId')
        .ifNotReturn()
        .string('https://kitsu.app/manga/<identifier>')
        .replace('<identifier>', $c.getVariable('kitsuId').run())
        .run();

      return $c
        .setVariable(
          'malId',
          getJsonData($c).get('links').ifNotReturn().get('mal').ifNotReturn().run(),
        )
        .setVariable(
          'anilistId',
          getJsonData($c).get('links').ifNotReturn().get('al').ifNotReturn().run(),
        )
        .setVariable(
          'kitsuId',
          getJsonData($c).get('links').ifNotReturn().get('kt').ifNotReturn().run(),
        )
        .coalesce($c.fn(getKitsu).run(), $c.fn(getAnilist).run(), $c.fn(getMal).run())
        .ifNotReturn()
        .log()
        .run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('#indicator').boolean().run(),
        current: $c =>
          $c.querySelector('#indicator .transition').text().regex('(\\d+)\\s*/', 1).number().run(),
        total: $c =>
          $c.querySelector('#indicator .transition').text().regex('/\\s*(\\d+)', 1).number().run(),
      },
      {
        current: $c =>
          $c.querySelector('#page-selector span').text().regex('(\\d+)\\s*/', 1).number().run(),
        total: $c =>
          $c.querySelector('#page-selector span').text().regex('/\\s*(\\d+)', 1).number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('title').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.text-xl\\/10').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('.transition[href]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      const getMal = $c
        .querySelector('a[href*="myanimelist"]')
        .ifNotReturn()
        .getAttribute('href')
        .run();

      const getAnilist = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .querySelector('a[href*="anilist"]')
        .getAttribute('href')
        .run();

      const getKitsu = $c
        .querySelector('a[href^="https://kitsu"]')
        .ifNotReturn()
        .provider()
        .equals('KITSU')
        .ifNotReturn()
        .string('https://kitsu.app/manga/<identifier>')
        .replace(
          '<identifier>',
          $c.querySelector('a[href^="https://kitsu"]').getAttribute('href').urlPart(6).run(),
        )
        .run();

      return $c
        .coalesce($c.fn(getKitsu).run(), $c.fn(getAnilist).run(), $c.fn(getMal).run())
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.titles').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.group > a[href^="/chapter/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.text().regex('Ch\\.?\\s*?(\\d+)', 1).number().run();
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
          $c.querySelector('#chapter-data').ifNotReturn().text().trim().run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.main.mobile').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
    syncIsReady($c) {
      return $c
        .querySelector('#chapter-data')
        .ifNotReturn()
        .text()
        .contains('\\/\\/')
        .ifNotReturn($c.trigger().return().run())
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#chapter-data').ifNotReturn().text().jsonParse();
}
