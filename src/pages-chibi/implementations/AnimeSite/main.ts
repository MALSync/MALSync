import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const AnimeSite: PageInterface = {
  name: 'AnimeSite',
  domain: 'https://animesite.fr',
  languages: ['French'],
  type: 'anime',
  urls: {
    // Sync pages: https://animesite.fr/play/{cryptedId}-{slug}/{season}/{episode}
    // Overview pages: https://animesite.fr/{cryptedId}-{slug}
    match: ['*://animesite.fr/*'],
  },
  search: 'https://animesite.fr/search/{searchtermPlus}',
  sync: {
    isSyncPage($c) {
      // Sync pages have "play" as the first URL segment
      return $c.url().urlPart(2).equals('play').run();
    },
    getTitle($c) {
      // URL: /play/{cryptedId}-{slug}/{season}/{episode}
      // urlPart(3) => "{cryptedId}-{slug}", strip the leading numeric id and capitalize
      return $c
        .url()
        .urlPart(3)
        .replaceRegex('^[0-9]+-', '')
        .replaceRegex('-', ' ')
        .run();
    },
    getIdentifier($c) {
      // Identifier is the slug without the cryptedId prefix
      return $c.url().urlPart(3).replaceRegex('^[0-9]+-', '').run();
    },
    getOverviewUrl($c) {
      // Overview URL: https://animesite.fr/{cryptedId}-{slug}
      return $c
        .string('https://animesite.fr/')
        .concat($c.url().urlPart(3).run())
        .run();
    },
    getEpisode($c) {
      // URL: /play/{cryptedId}-{slug}/{season}/{episode}
      // urlPart(5) => episode number
      return $c.url().urlPart(5).number().run();
    },
    getImage($c) {
      return getTVSeriesImage($c);
    },
  },
  overview: {
    isOverviewPage($c) {
      // Overview pages do NOT have "play" as the first segment
      return $c.url().urlPart(2).equals('play').not().run();
    },
    getTitle($c) {
      // URL: /{cryptedId}-{slug}
      // urlPart(2) => "{cryptedId}-{slug}"
      return $c
        .url()
        .urlPart(2)
        .replaceRegex('^[0-9]+-', '')
        .replaceRegex('-', ' ')
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(2).replaceRegex('^[0-9]+-', '').run();
    },
    getImage($c) {
      return getTVSeriesImage($c);
    },
    uiInjection($c) {
      return $c.querySelector('.space-y-4').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('li a[href*="/play/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};

/**
 * Extracts the image URL from the JSON-LD TVSeries schema on the page.
 */
function getTVSeriesImage($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('TVSeries').run())
    .ifNotReturn()
    .text()
    .jsonParse()
    .get('image')
    .run();
}
