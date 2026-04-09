import { PageInterface } from '../../pageInterface';

export const AniKoto: PageInterface = {
  name: 'AniKoto',
  type: 'anime',
  domain: 'https://anikototv.to/',
  languages: ['English'],
  urls: {
    match: ['*://anikototv.to/*'],
  },
  search: 'https://anikototv.to/filter?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('watch').run();
    },
    getTitle($c) {
      return $c.querySelector('div.binfo div.info h1').text().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).split('-').last().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('#w-episodes .ep-range li:first-child a')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.querySelector('#w-episodes a.active').getAttribute('data-num').number().run();
    },
    getImage($c) {
      return $c
        .querySelector('.binfo .poster img')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('#w-episodes a.active')
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
      return $c.querySelector('#controls').uiAfter().run();
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
        .waitUntilTrue($c.querySelector('div.binfo div.info h1').boolean().run())
        .trigger()
        .run();
    },
  },
};
