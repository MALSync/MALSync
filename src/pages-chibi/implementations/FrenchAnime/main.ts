import { PageInterface } from '../../pageInterface';

export const FrenchAnime: PageInterface = {
  name: 'French Anime',
  domain: 'french-anime.com',
  languages: ['French'],
  type: 'anime',
  urls: {
    match: ["*://*.french-anime.com/animes-vostfr/*-*.html", "*://*.french-anime.com/exclue/*-*.html"],
  },
  sync: {
    isSyncPage($c) {
      return $c.querySelector('#epselect').boolean().run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(-1).split('-').first().run();
    },
    getImage($c) {
      return $c.querySelector('.mov-img img#posterimg').getAttribute('src').ifNotReturn().urlAbsolute().run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },

    getEpisode($c) {
      return $c.querySelector('#epselect > option:selected').getAttribute('value').regex('button_(\\d+)', 1).number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.this('sync.isSyncPage').run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.this('sync.getImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('.tabsbox.filmlinks').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#epselect > option').run();
    },
    elementUrl($c) {
      return $c.url().run();
    },
    elementEp($c) {
      return $c.text().regex('Episode (\\d+)', 1).number().run();
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
      return $c.waitUntilTrue(
          $c.querySelector('#epselect').boolean().run()
        ).trigger().run();
    },
  },
};