import { PageInterface } from '../../pageInterface';

export const kotoplay: PageInterface = {
  name: 'AniKoto',
  domain: 'https://kotoplay.to',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.kotoplay.to/*'],
  },
  search: 'https://kotoplay.to/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1.at-wtitle').getBaseText().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    getImage($c) {
      return $c.querySelector('img.d-poster').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.at-whead').uiAfter().run();
    },
    nextEpUrl($c) {
      return $c
        .if(
          $c
            .url()
            .urlPart(5)
            .number()
            .lessThan($c.querySelector('#at-eppanel .ph-count').text().number().run())
            .run(),
          $c
            .url()
            .split('/')
            .slice(0, 5)
            .join('/')
            .concat('/')
            .concat($c.url().urlPart(5).number().calculate('+', 1).string().run())
            .run(),
          $c.boolean(false).run(),
        )
        .run();
    },
    getMalUrl($c) {
      return $c
        .querySelector('a.at-chip[href*="myanimelist.net/anime/"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#at-eppanel a[data-ep]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('data-ep').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./kotoplay.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().detectURLChanges($c.trigger().run()).trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('h1.at-wtitle').boolean().run(),
              $c
                .querySelector('.at-whead')
                .getAttribute('data-slug')
                .equals($c.url().urlPart(4).run())
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
