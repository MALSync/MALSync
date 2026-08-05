import { PageInterface } from '../../pageInterface';

export const ANIMO: PageInterface = {
  name: 'ANIMO',
  type: 'anime',
  domain: 'https://4animo.xyz',
  languages: ['English'],
  urls: {
    match: [
      // Watch pages: /watch/slug-id?ep=N
      '*://4animo.xyz/watch/*',
      '*://www.4animo.xyz/watch/*',
      // Overview pages live at root: /slug-id
      '*://4animo.xyz/*-[0-9]*',
      '*://www.4animo.xyz/*-[0-9]*',
    ],
  },
  search: 'https://4animo.xyz/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      // Watch pages: 4animo.xyz/watch/slug-id?ep=N
      return $c.url().urlPart(3).equals('watch').run();
    },
    getTitle($c) {
      return $c
        .querySelector('meta[property="og:title"]')
        .getAttribute('content')
        .trim()
        .regex('^Watch (.+) on ANIMO$')
        .ifNotReturn($c.querySelector('h1').text().trim().run())
        .run();
    },
    getIdentifier($c) {
      // Slug format: witch-hat-atelier-15818 → identifier is "15818"
      return $c.url().urlPart(4).split('-').last().run();
    },
    getOverviewUrl($c) {
      // Overview is at root: /witch-hat-atelier-15818
      return $c
        .string('/')
        .concat($c.url().urlPart(4).run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#animo-watch-actions').uiAppend().run();
    },
    getMalUrl($c) {
      // Prefer window.activeAnime if injected by the React client
      return $c
        .querySelector('meta[name="mal-id"]')
        .ifThen($c =>
          $c
            .getAttribute('content')
            .setVariable('malId')
            .ifNotReturn()
            .string('https://myanimelist.net/anime/')
            .concat($c.getVariable('malId').run())
            .return()
            .run(),
        )
        .provider()
        .equals('ANILIST')
        .ifThen($c =>
          $c
            .querySelector('meta[name="anilist-id"]')
            .ifThen($c =>
              $c
                .getAttribute('content')
                .setVariable('alId')
                .ifNotReturn()
                .string('https://anilist.co/anime/')
                .concat($c.getVariable('alId').run())
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
      // Overview is at root: /witch-hat-atelier-15818
      // It's NOT a watch page and the slug ends with a numeric ID
      return $c.url().urlPart(3).equals('watch').not().run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      // Slug format: witch-hat-atelier-15818 → identifier is "15818"
      return $c.url().urlPart(3).split('-').last().run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#animo-header-actions').uiAppend().run();
    },
    getMalUrl($c) {
      return $c.this('sync.getMalUrl').run();
    },
  },
  lifecycle: {
    setup($c) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#animo-watch-actions').boolean().run())
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#animo-header-actions').boolean().run())
        .trigger()
        .run();
    },
  },
};
