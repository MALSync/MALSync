/* eslint-disable @cspell/spellchecker */
import { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

/**
 * Checks if the current page is a Watch2Gether page.
 * @param {ChibiGenerator<any>} $c ChibiGenerator instance
 * @param {string} functionName Name of the function for logging purposes
 * @returns {ChibiJson<boolean>} boolean indicating if the current page is a Watch2Gether page
 */
function isWatch2Gether($c: ChibiGenerator<unknown>, functionName: string): ChibiJson<boolean> {
  return (
    $c
      .and(
        // Check if the current URL contains 'watch2gether' in the path
        $c.url().urlPart(3).equals('watch2gether').run(),
        // Check if the current URL contains 'rooms' in the path
        $c.url().urlPart(4).equals('rooms').run(),
      )
      // Log the result of the check
      .log(`${functionName} - Is Watch2Gether Page: `)
      .run()
  );
}

// Example Anime page URL: https://animekai.to/watch/ore-wa-seikan-kokka-no-akutoku-ryoushu-04yw#ep=1
// Example Watch2Gether URL: https://watch2gether.com/rooms/1234567890
export const animeKAI: PageInterface = {
  name: 'AnimeKAI',
  domain: 'https://animekai.to',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.animekai.to/*'],
  },
  search: 'https://animekai.to/browser?keyword={searchtermPlus}',
  sync: {
    // Should work
    isSyncPage($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.isSyncPage';

      // Check if the current page is a watch page or a watch2gether page and return true if it is and false otherwise
      return $c.url().urlPart(3).contains('watch').log(`${functionName} - Is Watch Page: `).run();

      // .or(
      //   $c.url().urlPart(3).equals('watch').run(),
      //   $c.url().urlPart(3).equals('watch2gether').run(),
      // )
      // .run();
    },
    // Should work
    getTitle($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getTitle';
      // Returns the title of the anime or manga. Used for searching on MyAnimeList.
      return $c
        .coalesce(
          // Get the title from the page from attribute data-jp
          $c
            .querySelector('#main-entity .title')
            .getAttribute('data-jp')
            .log(`${functionName} - Title found: `)
            .run(),
          // (Empty fallback) If it's a watch page and the title in the page is not found,
          // return the title of the page without the 'Anime' and 'Watch Online Free - AnimeKAI' prefix
          $c
            .if(
              // Check if the current URL is a watch page
              $c
                .url()
                .urlPart(3)
                .equals('watch')
                .log(`${functionName} - (FALLBACK) Is Watch Page: `)
                .run(),
              // Get the title from the anime page and removes the 'Anime' and 'Watch Online Free - AnimeKAI' affixes as a fallback
              $c
                .title()
                .regex('/^(Anime\\s*)?|(\\s*Watch Online Free - AnimeKAI\\s*)$/gi')
                .log(
                  `${functionName} - (FALLBACK) Title not found, using alternative title if watch page: `,
                )
                .run(),
              // Should return nothing but can't
              $c.string('Title not found').log(`${functionName} - `).run(),
            )
            .run(),
        )
        .ifNotReturn(/* should throw error for console */)
        .run();
    },
    // to test
    getIdentifier($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getIdentifier';
      // Regex to match the last word in the URL segment to get the identifier part
      //                                                                                \/
      // Example URL: https://animekai.to/watch/ore-wa-seikan-kokka-no-akutoku-ryoushu-04yw
      const idRegex = '\\w+$';
      // Returns the identifier of the anime or manga. Used for searching on MyAnimeList.
      return $c
        .if(
          // If the current page is a Watch2Gether page
          isWatch2Gether($c, functionName),
          // Get the identifier from overview url and get the last part of the URL with regex
          $c
            .this('sync.getOverviewUrl')
            .urlPart(4)
            .regex(idRegex)
            .log(`${functionName} - id from Watch2Gether: `)
            .run(),
          // Otherwise, get the identifier from the URL
          $c.url().urlPart(4).regex(idRegex).log(`${functionName} - id from URL: `).run(),
        )
        .run();
    },
    // Should work
    getOverviewUrl($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getOverviewUrl';
      return $c
        .if(
          // If the current page is a Watch2Gether page
          isWatch2Gether($c, functionName),
          // animekai.to + the URL from the Watch2Gether button
          $c
            .querySelector('#main-entity a.btn-primary')
            .getAttribute('href')
            .urlAbsolute(animeKAI.domain.toString())
            .log(`${functionName} - Watch2Gether URL: `)
            .run(),
          // Otherwise, return the canonical URL
          $c
            .querySelector('link[rel=canonical]')
            .getAttribute('href')
            .log(`${functionName} - Canonical URL: `)
            // If the Canonical URL is null or empty, get the current URL without query parameters
            .ifNotReturn($c.url().urlStrip().log(`${functionName} - Stripped URL: `).run())
            .run(),
        )
        .run();
    },
    // Should work
    getEpisode($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getEpisode';
      // make some code to have a regex to only get whats after the '#'
      return $c.url().regex('#ep=(\\d+)', 1).number().log(`${functionName} - Episode: `).run();
      // return parseInt(j.$('div.eplist a.active').attr('num') ?? j.$('#cur-ep-num')?.text() ?? '0'); (test without this and switch if current implementation is imperfect)
    },
    // TODO : next
    nextEpUrl($c) {
      //   const current = $c.dom().find('div.eplist a.active').parent();
      //   const nextEp = current.next().find('a').attr('href');
      //   if (nextEp) {
      //     return nextEp;
      //   }
      //   return current.closest('ul.range').next().find('li:first-child a').attr('href');
      return $c.string().run();
    },
    uiInjection($c) {
      // j.$('#main-entity div.info').after(j.html(selector));
      return $c.run();
    },
    // to do for page to detect anime maybe
    getMalUrl($c) {
      const watchPage = $c.querySelector('#watch-page');

      // return $c.if(watchPage.length, () => {
      //   const malId = watchPage.data('mal-id');
      //   if (malId) {
      //     return `https://myanimelist.net/anime/${malId}`;
      //   }
      //   const alId = watchPage.data('al-id');
      //   if (alId && provider === 'ANILIST') {
      //     return `https://anilist.co/anime/${alId}`;
      //   }
      //   return '';
      // });
      // const watchPage = j.$('#watch-page');
      // if (watchPage.length) {
      //   const malId = watchPage.data('mal-id');
      //   if (malId) {
      //     return `https://myanimelist.net/anime/${malId}`;
      //   }
      //   const alId = watchPage.data('al-id');
      //   if (alId && provider === 'ANILIST') {
      //     return `https://anilist.co/anime/${alId}`;
      //   }
      // }
      // return false;
      return $c.string().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .title()
        .contains('Error 404')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
