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
        .and($c.url().urlPart(3).equals('chapter').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('a[href*="/title/"]').text().trim().run(),
          $c
            .title()
            .replaceRegex('\n', '')
            .regex('Page \\d+:\\s*.*?-\\s*(.+?)\\s*WeebDex', 1) // a bit long to avoid preload matches
            .trim()
            .run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c
        .querySelector('a[href*="/title/"]')
        .boolean()
        .ifThen($c => $c.this('sync.getOverviewUrl').this('overview.getIdentifier').return().run())
        .this('sync.getTitle')
        .toLowerCase()
        .replaceAll('&', 'and')
        .replaceAll('%', 'percent') // edge case
        .replaceRegex('[^\\w\\s-]', '')
        .replaceRegex('\\W', ' ')
        .trim()
        .replaceRegex('\\s+', '-')
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/title/"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.querySelector('#chapter-selector span').text().regex('Ch\\.?\\s*?(\\d+)', 1).run(),
          $c.title().regex('Chapter (\\d+)', 1).run(),
        )
        .ifNotReturn($c.number(1).run())
        .number()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('#chapter-selector span')
        .ifNotReturn()
        .text()
        .regex('\\bVol\\.?\\s*?(\\d+)', 1)
        .number()
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
      return $c.url().urlPart(5).run();
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
        .detectChanges($c.url().urlPart(4).run(), $c.trigger().run())
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
    syncIsReady($c) {
      // Reduce errors spam from waiting title
      return $c.waitUntilTrue($c.querySelector('#reader').boolean().run()).trigger().run();
    },
  },
};
