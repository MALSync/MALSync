import { PageInterface } from '../../pageInterface';

export const AnimesDigital: PageInterface = {
  name: 'AnimesDigital',
  domain: 'https://animesdigital.org',
  languages: ['Portuguese'],
  type: 'anime',
  urls: {
    match: ['*://*.animesdigital.org/*'],
  },
  search: 'https://animesdigital.org/search/{searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('video').run();
    },
    getTitle($c) {
      return $c.querySelectorAll('.b_itens .info span:nth-child(2)').at(0).text().trim().run();
    },
    getIdentifier($c) {
      return $c
        .querySelector('.subitem a[href*="/anime/a/"]')
        .getAttribute('href')
        .urlPart(5)
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.subitem a[href*="/anime/a/"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.querySelectorAll('.b_itens .info span:nth-child(2)').at(1).text().number().run();
    },
    uiInjection($c) {
      // return $c.querySelector('#player').uiBefore().run(); // em cima player
      // debaixo do player return $c.querySelector('#player').uiAfter().run();
      // atras dos comentarios return $c.querySelector('.comentarios').uiBefore().run();
      return $c.querySelector('.tabs_videos').uiPrepend().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('anime').run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
    getImage($c) {
      return $c.querySelector('.poster img').getAttribute('src').ifNotReturn().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.item_ep a').run();
    },
    elementUrl($c) {
      return $c.target().getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.target().text().regex('Episódio\\s+(\\d+)', 1).number().run();
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
      return $c.waitUntilTrue($c.querySelector('#player').boolean().run()).trigger().run();
    },
  },
};
