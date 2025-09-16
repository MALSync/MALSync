import { PageInterface } from '../../pageInterface';

export const Miruro: PageInterface = {
  name: 'Miruro',
  domain: ['https://www.miruro.to', 'https://www.miruro.tv', 'https://www.miruro.online'],
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.miruro.to/*', '*://*.miruro.tv/*', '*://*.miruro.online/*'],
  },
  search: 'https://www.miruro.to/search?query={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('watch').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.title a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('#root a[href*="info/"] img').getAttribute('src').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('#root a[href*="info/"]').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().regex('/episode-(\\d+)', 1).number().run();
    },
    getMalUrl($c) {
      const getMalId = $c
        .querySelector("a[href^='https://myanimelist.net']")
        .getAttribute('href')
        .run();
      const getAnilistId = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .querySelector("a[href^='https://anilist.co']")
        .getAttribute('href')
        .run();

      return $c.coalesce($c.fn(getAnilistId).run(), $c.fn(getMalId).run()).ifNotReturn().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('info').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#root h1 span').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c.querySelector('#root h1').uiAfter().run();
    },
    getMalUrl($c) {
      const getMalId = $c
        .querySelector("a[href^='https://myanimelist.net']")
        .getAttribute('href')
        .run();
      const getAnilistId = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .querySelector("a[href^='https://anilist.co']")
        .getAttribute('href')
        .run();

      return $c.coalesce($c.fn(getAnilistId).run(), $c.fn(getMalId).run()).ifNotReturn().run();
    },
    getImage($c) {
      return $c.querySelector('img[alt="Cover"]').getAttribute('src').ifNotReturn().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.url().urlPart(3).equals('watch').run(),
              $c.url().urlPart(4).boolean().run(),
              $c.url().urlPart(5).boolean().run(),
              $c.querySelector('.title a').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.url().urlPart(3).equals('info').run(),
              $c.url().urlPart(4).boolean().run(),
              $c.url().urlPart(5).boolean().run(),
              $c.querySelector('#root h1 span').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
