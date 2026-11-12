import { PageInterface } from '../../pageInterface';

export const Shinden: PageInterface = {
  name: 'Shinden',
  type: 'anime',
  domain: 'https://shinden.pl',
  languages: ['Polish'],
  urls: {
    match: ['*://shinden.pl/episode/*', '*://shinden.pl/series/*', '*://shinden.pl/titles/*'],
  },
  search: 'https://shinden.pl/series?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('episode').run(), $c.url().urlPart(5).equals('view').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.sh-tp-head h1').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/<identifier>/episodes')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      // "Odcinek 4"
      return $c
        .querySelector('.ep-head__title')
        .ifNotReturn()
        .text()
        .regex('(\\d+)', 1)
        .ifNotReturn()
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ep-nav a.ep-nav__step[rel="next"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c
            .or(
              $c.url().urlPart(3).equals('series').run(),
              $c.url().urlPart(3).equals('titles').run(),
            )
            .run(),
          $c.url().urlPart(4).matches('^\\d+-').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return (
        $c
          // series covers only, not the generic "/assets/img/og-shinden-2.jpg"
          .querySelector('meta[property="og:image"][content*="/og/s/"]')
          .ifNotReturn()
          .getAttribute('content')
          .ifNotReturn()
          .urlAbsolute()
          .run()
      );
    },
    uiInjection($c) {
      return $c.querySelector('.sh-tp-head .sh-tp-meta').ifNotReturn().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('li.ep-row a.ep-row__link').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.ep-row__no').ifNotReturn().text().trim().number().run();
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
