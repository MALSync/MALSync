import { PageInterface } from '../../pageInterface';

export const Anizium: PageInterface = {
  name: 'Anizium',
  type: 'anime',
  domain: 'https://anizium.co',
  languages: ['Turkish'],
  urls: {
    match: ['*://anizium.co/*'],
  },
  search: 'https://anizium.co/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().contains('/watch/').run();
    },
    getTitle($c) {
      return $c
        .querySelector('.trending-text')
        .text()
        .trim()
        .replaceRegex('\\s+S\\d+\\s+B\\d+.*', '')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://anizium.co/anime/')
        .concat($c.this('sync.getIdentifier').run())
        .run();
    },
    getEpisode($c) {
      return $c.url().urlParam('episode').number().run();
    },
    nextEpUrl($c) {
      const nextButton = $c.querySelector('#next_link');
      return $c
        .if(
          nextButton.getAttribute('href').boolean().run(),
          nextButton.getAttribute('href').urlAbsolute().run(),
          $c.string('').run(),
        )
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().contains('/anime/').run();
    },
    getTitle($c) {
      return $c.querySelector('h5.main-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c.querySelector('h5.main-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href*="watch"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').regex('[&?]episode=(\\d+)', 1).number().run();
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
  },
};
