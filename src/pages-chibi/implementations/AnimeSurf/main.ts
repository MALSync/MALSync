import { PageInterface } from '../../pageInterface';

export const AnimeSurf: PageInterface = {
  name: 'AnimeSurf',
  domain: 'https://anime.surf',
  languages: ['Polish'],
  type: 'anime',
  urls: {
    match: [
      '*://anime.surf/anime/*',
      '*://anime.surf/watch/*',
      '*://anime.surf/embed/*',
      '*://anime.surf/watchparty/*',
    ],
  },
  search: 'https://anime.surf/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c.url().urlPart(3).equals('watch').run(),
          $c.url().urlPart(3).equals('embed').run(),
          $c.url().urlPart(3).equals('watchparty').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[mal_sync="title"], main h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .coalesce(
          $c.querySelector('a[mal_sync="title"]').getAttribute('href').run(),
          $c
            .string('/anime/')
            .concat($c.url().urlPart(4).run())
            .run(),
        )
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.url().urlParam('episode').run(),
          $c.querySelector('[mal_sync="episode"]').text().trim().run(),
          $c.string('1').run(),
        )
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .string('/watch/')
        .concat($c.url().urlPart(4).run())
        .concat('?episode=')
        .concat($c.this('sync.getEpisode').calculate('+', 1).string().run())
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: $c
            .querySelector('span[mal_sync="mal_id"]')
            .getAttribute('mal_sync_mal_id')
            .run(),
          anilistId: $c
            .coalesce(
              $c
                .querySelector('span[mal_sync="anilist_id"]')
                .getAttribute('mal_sync_anilist_id')
                .run(),
              $c.url().urlPart(4).regex('^(\\d+)$', 1).run(),
            )
            .run(),
        })
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('anime').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[mal_sync="title"], h1.text-3xl').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('img[alt]').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c
        .querySelector('div[mal_sync="info"], h1.text-3xl')
        .uiAfter()
        .run();
    },
    getMalUrl($c) {
      return $c.this('sync.getMalUrl').run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('div[mal_sync="episodes"], a[href*="/watch/"][href*="episode="]')
        .run();
    },
    elementUrl($c) {
      return $c
        .coalesce(
          $c.find('a[href]').getAttribute('href').run(),
          $c.getAttribute('href').run(),
          $c.string('').run(),
        )
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return $c
        .coalesce(
          $c.find('[mal_sync="episode"]').text().trim().run(),
          $c.this('list.elementUrl').urlParam('episode').run(),
        )
        .number()
        .run();
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
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('a[mal_sync="title"], main h1').text().trim().boolean().run(),
              $c
                .querySelector('a[mal_sync="title"], main h1')
                .text()
                .trim()
                .equals('Ładowanie...')
                .not()
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c.querySelector('a[mal_sync="title"], h1.text-3xl').text().trim().boolean().run(),
        )
        .trigger()
        .run();
    },
  },
};
