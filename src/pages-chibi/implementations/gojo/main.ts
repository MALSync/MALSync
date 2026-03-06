import { PageInterface } from '../../pageInterface';

export const gojo: PageInterface = {
  name: 'Gojo',
  domain: ['https://animetsu.net'],
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://animetsu.cc/*', '*://animetsu.bz/*', '*://animetsu.net/*', '*://animetsu.live/*'],
  },
  search: 'https://animetsu.live/search?query={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('watch').run();
    },
    getTitle($c) {
      return $c
        .querySelector(
          $c
            .string('a[href="/anime/')
            .concat($c.url().this('sync.getIdentifier').run())
            .concat('"].flex-center')
            .run(),
        )
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/anime/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.bg-white\\/10.ml-auto')
        .ifNotReturn()
        .text()
        .regex('ep (\\d+)', 1)
        .number()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('anime').run();
    },
    getTitle($c) {
      return $c.title().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('.aspect-cover img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.text-xl').uiAfter().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          anilistUrl: $c
            .querySelector('[href^="https://anilist.co/anime/"]')
            .getAttribute('href')
            .run(),
          malUrl: $c
            .querySelector('[href^="https://myanimelist.net/anime/"]')
            .getAttribute('href')
            .run(),
        })
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.bubbly a[href^="/watch/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').urlParam('ep').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectChanges($c.url().concat($c.title().run()).run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
