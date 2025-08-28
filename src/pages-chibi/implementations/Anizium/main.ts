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
      const element = $c.querySelector('.trending-text');
      const season = $c.url().urlParam('season');

      // Generic season-aware title (inspired by Crunchyroll)
      return $c
        .if(
          // Season 2+ için generic enhancement
          $c.and(element.boolean().run(), season.number().greaterThan(1).run()).run(),
          // "Title Season N" format
          element
            .text()
            .trim()
            .replaceRegex('\\s+S\\d+\\s+B\\d+.*', '')
            .trim()
            .concat(' Season ')
            .concat(season.string().run())
            .run(),
          // Season 1 veya yok: normal cleaning
          $c
            .if(
              element.boolean().run(),
              element.text().trim().replaceRegex('\\s+S\\d+\\s+B\\d+.*', '').trim().run(),
              $c.string('').run(),
            )
            .run(),
        )
        .run();
    },
    getIdentifier($c) {
      // Season-aware identifier (Netflix tarzı) - her sezon ayrı MAL entry
      const baseId = $c.url().urlPart(4);
      const season = $c.url().urlParam('season');

      return $c
        .if(
          // Eğer season parametresi varsa, enhanced identifier oluştur
          $c.and(baseId.boolean().run(), season.boolean().run()).run(),
          // Format: "392217205?s=2" - her sezon ayrı identifier
          baseId.concat('?s=').concat(season.string().run()).run(),
          // Fallback: sadece base ID
          baseId.run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      // Base ID'yi al (season parametresi olmadan)
      const baseId = $c.url().urlPart(4);
      return $c.string('https://anizium.co/anime/').concat(baseId.run()).run();
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
