import { PageInterface } from '../../pageInterface';

export const animepahe: PageInterface = {
  name: 'animepahe',
  domain: 'https://animepahe.com',
  languages: ['English'],
  type: 'anime',
  database: 'animepahe',
  minimumVersion: '0.12.1',
  search: 'https://animepahe.si/', // Temporary workaround until next release
  urls: {
    match: [
      '*://animepahe.com/play/*',
      '*://animepahe.com/anime/*',
      '*://animepahe.org/play/*',
      '*://animepahe.org/anime/*',
      '*://animepahe.si/play/*',
      '*://animepahe.si/anime/*',
    ],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('play').run();
    },
    getTitle($c) {
      return $c.querySelector('.theatre-info h1 a').text().trim().run();
    },
    getIdentifier($c) {
      return $c
        .querySelector('meta[name=id]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    getOverviewUrl($c) {
      return $c.string('/a/').concat($c.this('sync.getIdentifier').run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.querySelector('.theatre-info h1').getBaseText().regex('[0-9.]+').number().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.sequel a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    uiInjection($c) {
      return $c.querySelector('.anime-season').uiAfter().run();
    },
    getMalUrl($c) {
      return $c
        .querySelector('meta[name=myanimelist]')
        .ifThen($c =>
          $c
            .getAttribute('content')
            .setVariable('mal')
            .string('https://myanimelist.net/anime/')
            .concat($c.getVariable('mal').run())
            .return()
            .run(),
        )
        .provider()
        .equals('ANILIST')
        .ifThen($c =>
          $c
            .querySelector('meta[name=anilist]')
            .ifThen($c =>
              $c
                .getAttribute('content')
                .setVariable('al')
                .string('https://anilist.co/anime/')
                .concat($c.getVariable('al').run())
                .return()
                .run(),
            )
            .run(),
        )
        .provider()
        .equals('KITSU')
        .ifThen($c =>
          $c
            .querySelector('meta[name=kitsu]')
            .ifThen($c =>
              $c
                .getAttribute('content')
                .setVariable('kitsu')
                .string('https://kitsu.app/anime/')
                .concat($c.getVariable('kitsu').run())
                .return()
                .run(),
            )
            .run(),
        )
        .boolean(false)
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('anime').run();
    },
    getTitle($c) {
      return $c.querySelector('.title-wrapper h1 > span').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    uiInjection($c) {
      return $c.querySelector('.anime-content').uiPrepend().run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    getMalUrl($c) {
      return $c.this('sync.getMalUrl').run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episode-list .episode').run();
    },
    elementUrl($c) {
      return $c.find('a').ifNotReturn().getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.episode-number').getBaseText().trim().number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectURLChanges($c.trigger().run())
        .waitUntilTrue($c.this('sync.getIdentifier').boolean().run())
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.this('list.elementsSelector').length().boolean().run())
        .trigger()
        .run();
    },
  },
};
