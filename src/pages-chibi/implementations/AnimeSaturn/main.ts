import { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Dubbed entries are separate series with " (ITA)" in the title
function cleanTitle($c: ChibiGenerator<string>) {
  return $c.replaceRegex('\\s*\\(ITA\\)\\s*$', '').trim();
}

export const AnimeSaturn: PageInterface = {
  name: 'AnimeSaturn',
  domain: 'https://www.animesaturn.net',
  languages: ['Italian'],
  type: 'anime',
  urls: {
    // Other official domains redirect to .net. animemars.org (also official) has a different frontend
    match: ['*://*.animesaturn.net/*'],
    player: {
      saturn: ['*://play.saturncdn.net/*'],
    },
  },
  search: 'https://www.animesaturn.net/filter?key={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlPart(5).matches('^ep-\\d').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a.player-card__title').text().exec(cleanTitle).run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.string('/anime/').concat($c.url().urlPart(4).run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('^ep-(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      // Built from the number instead of the list order, so .5 specials are skipped
      return $c
        .querySelector(
          $c
            .string('a.ep-tile[href="/anime/')
            .concat($c.url().urlPart(4).run())
            .concat('/ep-')
            .concat($c.url().this('sync.getEpisode').calculate('+', 1).string().run())
            .concat('"]')
            .run(),
        )
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c.querySelector('img[src*="/locandine/"]').getAttribute('src').ifNotReturn().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.ag-head h1').text().exec(cleanTitle).run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c.querySelector('.ag-headwrap').uiAfter().run();
    },
    getImage($c) {
      return $c.querySelector('img[src*="/locandine/"]').getAttribute('src').ifNotReturn().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector("a[href^='https://myanimelist.net/anime/']")
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          anilistUrl: $c
            .querySelector("a[href^='https://anilist.co/anime/']")
            .ifNotReturn()
            .getAttribute('href')
            .run(),
        })
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      // The overview links to /episode/, the player to /anime/. Specials like ep-7-5 are left out.
      return $c
        .querySelectorAll('a.ep-tile')
        .filter($el =>
          $el
            .getAttribute('href')
            .matches(
              $c
                .string('^/(anime|episode)/')
                .concat($c.url().urlPart(4).run())
                .concat('/ep-\\d+$')
                .run(),
            )
            .run(),
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').replace('/episode/', '/anime/').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').regex('/ep-(\\d+)$', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      // Episodes are switched without a reload (episode list, next button, autonext)
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
