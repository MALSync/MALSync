import { PageInterface } from '../../pageInterface';

export const anikoto: PageInterface = {
  name: 'AniKoto',
  domain: 'https://anikoto.cz',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.anikoto.cz/*', '*://*.anikototv.to/*'],
    player: {
      megaplay: ['*://vidwish.live/*', '*://megaplay.buzz/*'],
      vidtube: ['*://vidtube.site/*'],
    },
  },
  search: 'https://anikoto.cz/filter?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c.querySelector('#w-episodes a.active').getAttribute('data-num').number().run();
    },
    getImage($c) {
      return $c.querySelector('[itemprop="image"]').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1[itemprop="name"]').uiAfter().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('#w-episodes .episodes .active')
        .parent()
        .next()
        .ifNotReturn()
        .find('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: $c
            .querySelector('#w-episodes .episodes .active')
            .getAttribute('data-mal')
            .number()
            .ifNotReturn()
            .run(),
        })
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#w-episodes .ep-range a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('data-num').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().detectURLChanges($c.trigger().run()).trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#w-episodes .episodes .active').boolean().run())
        .trigger()
        .run();
    },
  },
};
