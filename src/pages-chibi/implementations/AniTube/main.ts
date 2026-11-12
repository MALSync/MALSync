import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Every title page holds the description and the player, there is no separate episode page.

const activeEpisode = '.playlists-videos li.active';

// "1 серія", "Серія 01", "1-2 серія"; films are labelled "Фільм" without a number
function episodeNumber($c: ChibiGenerator<Element>) {
  return $c
    .text()
    .setVariable('episodeLabel')
    .matches('\\d')
    .ifNotReturn($c.number(1).run())
    .getVariable('episodeLabel')
    .string()
    .regexAutoGroup('^\\D*(?:\\d+\\s*[-–]\\s*)?(\\d+)\\s*сер|сері\\S*\\s*(\\d+)|(\\d+)')
    .number();
}

export const AniTube: PageInterface = {
  name: 'AniTube',
  domain: 'https://anitube.in.ua',
  languages: ['Ukrainian'],
  type: 'anime',
  urls: {
    match: ['*://anitube.in.ua/*', '*://*.anitube.in.ua/*'],
    player: {
      ashdi: ['*://*.ashdi.vip/*'],
      moonanime: ['*://*.moonanime.net/*'],
      fenixplay: ['*://*.fenixplay.xyz/*'],
    },
  },
  search: 'https://anitube.in.ua/index.php?do=search&subaction=search&story={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlStrip().matches('^https?://[^/]+/\\d+-[^/]+\\.html$').run();
    },
    getTitle($c) {
      // The share links carry "<Ukrainian> / <original>" or only the original title.
      // The Ukrainian part can contain " / " itself, so the last segment is used.
      return $c
        .coalesce(
          $c
            .fn(
              $c
                .querySelector('.social-buttons a[href^="mailto:"]')
                .ifNotReturn()
                .getAttribute('href')
                .ifNotReturn()
                .regex('subject=(?:.*\\s\\/\\s)?(.+?)(?:&body=|$)', 1)
                .replaceRegex('\\s*\\(TV-?\\d*\\)\\s*$', '')
                .trim()
                .ifNotReturn()
                .run(),
            )
            .run(),
          $c.fn($c.querySelector('.rcol h2').ifNotReturn().getBaseText().trim().run()).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlStrip().regex('/(\\d+)-[^/]+\\.html$', 1).run();
    },
    getOverviewUrl($c) {
      return $c.url().urlStrip().run();
    },
    getEpisode($c) {
      return $c.querySelector(activeEpisode).ifNotReturn().exec(episodeNumber).run();
    },
    getImage($c) {
      return $c
        .querySelector('.story_post img')
        .ifNotReturn()
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.rcol h2').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      // Only the episodes of the selected dub and player are visible
      return $c.querySelectorAll('.playlists-videos li.pl-vis').run();
    },
    elementEp($c) {
      return $c.exec(episodeNumber).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .trigger()
        .detectChanges(
          $c.querySelector(activeEpisode).ifNotReturn().getAttribute('data-file').run(),
          $c.trigger().run(),
        )
        .run();
    },
    syncIsReady($c) {
      // The playlist is loaded with ajax after the page
      return $c.waitUntilTrue($c.querySelector(activeEpisode).boolean().run()).trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .querySelector('.playlists-videos li.pl-vis')
            .ifNotReturn()
            .getAttribute('data-id')
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
