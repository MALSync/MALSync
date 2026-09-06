import { PageInterface } from '../../pageInterface';

export const AnimeNoSub: PageInterface = {
  name: 'AnimeNoSub',
  domain: 'https://animenosub.to',
  languages: ['English', 'Japanese'],
  type: 'anime',
  urls: {
    match: ['*://animenosub.to/*'],
  },
  search: 'https://animenosub.to/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.querySelector('.megavid').boolean().run();
    },
    getTitle($c) {
      return $c
        .querySelector('meta[property="article:section"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.item.meta a[href*="/anime/"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).regex('-episode-(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.naveps [aria-label="next"]')
        .getAttribute('href')
        .ifNotReturn()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.querySelector('.animefull').boolean().run();
    },
    getTitle($c) {
      return $c.querySelector('div.infox > h1.entry-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().replace('anime/', '').urlPart(3).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('div.infox > h1.entry-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.eplister [data-index]').run();
    },
    elementUrl($c) {
      return $c.target().find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
