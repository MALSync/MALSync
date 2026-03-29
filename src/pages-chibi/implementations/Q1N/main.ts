import { PageInterface } from '../../pageInterface';

export const Q1N: PageInterface = {
  name: 'Topanimes',
  domain: ['https://topanimes.net'],
  languages: ['Portuguese'],
  type: 'anime',
  urls: {
    match: ['*://topanimes.net/*'],
  },
  search: 'https://topanimes.net/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c.url().urlPart(3).equals('episodio').run(),
          $c.url().urlPart(3).equals('filmes').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('#titleHis').text().split('- EP').at(0).trim().run(),
          $c.querySelector('.data h1').text().trim().run(),
        )
        .ifNotReturn()
        .run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.poster a')
        .getAttribute('href')
        .ifNotReturn($c.url().run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('#titleHis')
        .text()
        .split('- EP')
        .at(1)
        .trim()
        .number()
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.pag_episodes .item:nth-child(3) a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('animes').run();
    },
    getTitle($c) {
      return $c.querySelector('.sheader h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .trim()
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#single .sgeneros').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episodios [data-id], .episodios [class^="item-"]').run();
    },
    elementUrl($c) {
      return $c.target().find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.target().find('.epnumber').text().trim().number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};
