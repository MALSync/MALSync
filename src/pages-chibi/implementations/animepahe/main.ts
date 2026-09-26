import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const animepahe: PageInterface = {
  name: 'animepahe',
  domain: 'https://animepahe.com',
  languages: ['English'],
  type: 'anime',
  database: 'animepahe',
  minimumVersion: '0.12.6',
  urls: {
    match: [
      '*://animepahe.com/play/*',
      '*://animepahe.com/anime/*',
      '*://animepahe.com/a/*',
      '*://animepahe.org/play/*',
      '*://animepahe.org/anime/*',
      '*://animepahe.org/a/*',
      '*://animepahe.si/play/*',
      '*://animepahe.si/anime/*',
      '*://animepahe.si/a/*',
      '*://animepahe.pw/play/*',
      '*://animepahe.pw/anime/*',
      '*://animepahe.pw/a/*',
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
        .providerUrlUtility({
          malId: $c
            .querySelector('meta[name=mal], meta[name=myanimelist]')
            .getAttribute('content')
            .number()
            .ifNotReturn()
            .run(),
          anilistId: $c
            .querySelector('meta[name=anilist]')
            .getAttribute('content')
            .number()
            .ifNotReturn()
            .run(),
          kitsuId: $c
            .querySelector('meta[name=kitsu]')
            .getAttribute('content')
            .number()
            .ifNotReturn()
            .run(),
        })
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
        .if(
          $c.url().urlPart(3).equals('a').run(),
          // /a/<id> links stopped redirecting and /anime/<session> links rotate,
          // so look up the current session through the site search
          (
            $c
              .string('https://api.malsync.moe/page/animepahe/')
              .concat($c.url().urlPart(4).run())
              .fetchJson()
              .get('title')
              .ifNotReturn()
              .string()
              .replaceRegex('[^a-z0-9]+', ' ')
              .setVariable('paheTitle')
              .string('/api?m=search&q=')
              .concat($c.getVariable('paheTitle').string().run())
              .fetchJson() as ChibiGenerator<{ data?: { id: number; session: string }[] }>
          )
            .get('data')
            .ifNotReturn()
            .arrayFind($item => $item.get('id').equals($c.url().urlPart(4).number().run()).run())
            .ifNotReturn()
            .get('session')
            .setVariable('paheSession')
            .string('/anime/')
            .concat($c.getVariable('paheSession').string().run())
            .urlAbsolute()
            .redirect()
            .run(),
          $c
            .detectURLChanges($c.trigger().run())
            .waitUntilTrue($c.this('sync.getIdentifier').boolean().run())
            .trigger()
            .run(),
        )
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
