import { PageInterface } from '../../pageInterface';

export const AniXL: PageInterface = {
  name: 'AniXL',
  domain: ['https://anixl.to'],
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://anixl.to/*'],
  },
  search: 'https://anixl.to/search?word={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('title').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('main div div a[href^="/title/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(4).regex('^(\\d+)-?', 1).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('main div div a[href^="/title/"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('main div div:nth-child(2) a[href^="/title/"]')
        .text()
        .regex('Ep (\\d+)', 1)
        .number()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('title').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('main h3 a[href^="/title/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    uiInjection($c) {
      return $c.querySelector('div[data-name="episode-list"]').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div[data-name="episode-list"] a[href^="/title/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.text().regex('\\d+', 0).number().run();
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
