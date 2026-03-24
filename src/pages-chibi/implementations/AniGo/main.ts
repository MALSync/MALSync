import { PageInterface } from '../../pageInterface';

export const AniGo: PageInterface = {
  name: 'AniGo',
  type: 'anime',
  domain: 'https://anigo.to',
  languages: ['English'],
  urls: {
    match: ['*://anigo.to/*'],
  },
  search: 'https://anigo.to/browser?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.aniDetail .title').text().replaceLinebreaks().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-[^-]+$', '').trim().run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('#.+$', '').run();
    },
    getEpisode($c) {
      return $c.querySelector('.episodeList .active .number').text().number().run();
    },
    getImage($c) {
      return $c.querySelector('.poster img').getAttribute('src').ifNotReturn().urlAbsolute().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.episodeList .active')
        .parent()
        .next()
        .find('a')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#servers').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episodeList ul li a').run();
    },
    elementEp($c) {
      return $c.find('.number').text().number().run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectURLChanges($c.trigger().run(), { ignoreQuery: false, ignoreAnchor: false })
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.url().contains('#ep').run()).trigger().run();
    },
  },
};
