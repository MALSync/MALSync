import { PageInterface } from '../../pageInterface';

export const Anizium: PageInterface = {
  name: 'Anizium',
  type: 'anime',
  domain: 'https://anizium.co',
  languages: ['Turkish'],
  urls: {
    match: ['*://anizium.co/*', '*://www.anizium.co/*', '*://m.anizium.co/*'],
  },
  search: 'https://anizium.co/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().contains('/watch/').run(),
          // Ensure we have valid episode data
          $c
            .or(
              $c.url().urlParam('episode').boolean().run(),
              $c.querySelector('.episode-info').boolean().run(),
            )
            .run(),
        )
        .run();
    },
    getTitle($c) {
      const element = $c.querySelector('.trending-text');
      return $c
        .coalesce(
          // Primary: trending-text selector with cleaning
          element.text().trim().replaceRegex('\\s+S\\d+\\s+B\\d+.*', '').trim().run(),
          // Fallback 1: page title cleaning
          $c.title().replaceRegex(' - Anizium.*', '').trim().run(),
          // Fallback 2: meta og:title
          $c.querySelector('meta[property="og:title"]').getAttribute('content').run(),
          // Fallback 3: h1 title
          $c.querySelector('h1').text().trim().run(),
        )
        .ifNotReturn()
        .run();
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
      // Get base ID (without season parameter)
      const baseId = $c.url().urlPart(4);
      return $c.string('https://anizium.co/anime/').concat(baseId.run()).run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          // Primary: URL parameter
          $c.url().urlParam('episode').number().run(),
          // Fallback 1: from page elements
          $c.querySelector('.episode-info').text().regex('(\\d+)', 1).number().run(),
          // Fallback 2: from breadcrumb or navigation
          $c.querySelector('.breadcrumb').text().regex('Episode\\s+(\\d+)', 1).number().run(),
          // Default fallback
          $c.number(1).run(),
        )
        .run();
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
      return $c
        .coalesce(
          // Primary: main-title
          $c.querySelector('h5.main-title').text().trim().run(),
          // Fallback 1: any h5 title
          $c.querySelector('h5').text().trim().run(),
          // Fallback 2: page title
          $c.title().replaceRegex(' - Anizium.*', '').trim().run(),
          // Fallback 3: meta og:title
          $c.querySelector('meta[property="og:title"]').getAttribute('content').run(),
        )
        .ifNotReturn()
        .run();
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
      return $c
        .title()
        .contains('404')
        .or(
          $c
            .title()
            .contains('Error')
            .or(
              $c.title().contains('Not Found').or($c.title().contains('Server Error').run()).run(),
            )
            .run(),
        )
        .ifThen($c => $c.string('404').log().return().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
