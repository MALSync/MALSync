import { PageInterface } from '../../pageInterface';

export const anikoto: PageInterface = {
  name: 'AniKoto',
  domain: 'https://anikoto.cz',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.anikoto.cz/*', '*://*.anikototv.to/*'],
  },
  search: 'https://anikoto.cz/filter?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(5).boolean().run()).run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('/ep-\\d+$', '').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).replaceRegex('ep-', '').number().run();
    },
    getImage($c) {
      return $c.querySelector('[itemprop="image"]').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('#controls').uiAfter().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('#w-episodes .active')
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
        .string('https://myanimelist.net/anime/<identifier>')
        .replace('<identifier>', $c.querySelector('#w-episodes .active').getAttribute('data-mal').ifNotReturn().run())
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
      return $c.querySelector('#w-episodes .active').boolean().run();
    },
  },
};
