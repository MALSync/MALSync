import { PageInterface } from '../../pageInterface';

export const Anizium: PageInterface = {
  name: 'Anizium',
  type: 'anime',
  domain: 'https://anizium.co',
  languages: ['Turkish'],
  urls: {
    match: ['*://*.anizium.co/*'],
  },
  search: 'https://anizium.co/search?value={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().contains('/watch/').run();
    },
    getTitle($c) {
      const element = $c.querySelector('.trending-text');
      return element.text().trim().replaceRegex('\\s+S\\d+\\s+B\\d+.*', '').trim().run();
    },
    getIdentifier($c) {
      // Universal season-aware identifier for all anime
      const baseId = $c.url().urlPart(4);
      const season = $c.url().urlParam('season');

      return $c
        .if(
          // If season parameter exists, create enhanced identifier
          $c.and(baseId.boolean().run(), season.boolean().run()).run(),
          // Format: "{animeId}?s={season}" - separate identifier for each season
          baseId.concat('?s=').concat(season.string().run()).run(),
          // Fallback: base ID only
          baseId.run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      const baseId = $c.url().urlPart(4);
      return $c.string('/anime/').concat(baseId.run()).urlAbsolute().run();
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

  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episode-block').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').urlParam('episode').number().run();
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
