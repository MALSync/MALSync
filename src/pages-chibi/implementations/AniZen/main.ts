import { PageInterface } from '../../pageInterface';

export const AniZen: PageInterface = {
  name: 'AniZen',
  domain: 'https://anizen.tr',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://anizen.tr/*'],
  },
  search: 'https://anizen.tr/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h2.title-font').text().trim().run();
    },
    getIdentifier($c) {
      // The site appends a `?v=<timestamp>` cache-buster to the URL; strip it.
      return $c.url().urlPart(4).replaceRegex('[?#].*$', '').run();
    },
    getOverviewUrl($c) {
      // AniZen has no separate overview page; the watch URL is the canonical page.
      return $c
        .string('/watch/')
        .concat($c.this('sync.getIdentifier').run())
        .urlAbsolute('https://anizen.tr')
        .run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getEpisode($c) {
      return $c
        .querySelector('[data-anime-id][data-episode]')
        .getAttribute('data-episode')
        .ifNotReturn()
        .number()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h2.title-font').uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      // Re-sync on episode change: the player exposes the current episode via
      // `data-episode`, so watch both the URL and that attribute.
      return $c
        .detectChanges(
          $c
            .url()
            .concat(
              $c
                .querySelector('[data-anime-id][data-episode]')
                .getAttribute('data-episode')
                .ifNotReturn($c.string('').run())
                .run(),
            )
            .run(),
          $c.trigger().run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      // Wait for the title to hydrate before syncing so the match isn't run on empty data.
      return $c.waitUntilTrue($c.querySelector('h2.title-font').boolean().run()).trigger().run();
    },
  },
};
