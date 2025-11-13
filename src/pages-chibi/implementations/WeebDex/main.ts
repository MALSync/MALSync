import { PageInterface } from '../../pageInterface';

export const WeebDex: PageInterface = {
  name: 'WeebDex',
  domain: 'https://weebdex.org/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://weebdex.org/*'],
  },
  search: 'https://weebdex.org/search?title={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('chapter').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[href^="/title/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('a[href^="/title/"]').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c
        .querySelector('button.truncate')
        .text()
        .regex('Ch\\.?\\s*?(\\d+)', 1)
        .number()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('button.truncate')
        .text()
        .regex('Vol\\.?\\s*?(\\d+)', 1)
        .number()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: 'button.flex-auto:not(.truncate)',
          mode: 'text',
          regex: '(\\d+)\\s*/\\s*(\\d+)',
          group: 1,
        },
        total: {
          selector: 'button.flex-auto:not(.truncate)',
          mode: 'text',
          regex: '(\\d+)\\s*/\\s*(\\d+)',
          group: 2,
        },
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
      return $c.url().urlPart(5).run();
    },
    getImage($c) {
      // property og image give first manga image you read if you didn't reload the website both in overview/chapter page
      return $c
        .querySelector('.object-center')
        .getAttribute('src')
        .urlAbsolute()
        .ifNotReturn()
        .run();
    },
    getMalUrl($c) {
      const getMal = $c
        .provider()
        .equals('MAL')
        .ifNotReturn()
        .querySelector('a[href*="myanimelist"]')
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
        .coalesce($c.fn(getMal).run(), $c.fn(getAnilist).run(), $c.fn(getKitsu).run())
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.titles').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href^="/chapter/"]').run();
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
        .detectChanges($c.url().urlPart(3).run(), $c.trigger().run())
        .domReady()
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
  },
};
