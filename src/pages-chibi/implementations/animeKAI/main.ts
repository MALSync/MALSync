/* eslint-disable @cspell/spellchecker */
import { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

/**
 * Checks if the current page is a Watch2Gether page.
 * @param {ChibiGenerator<any>} $c ChibiGenerator instance
 * @param {string} functionName Name of the function for logging purposes
 * @returns {ChibiJson<boolean>} boolean wrapped in ChibiJson indicating if the current page is a Watch2Gether page
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
      // .log(`${functionName} - Is Watch2Gether Page`)
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
    match: ['*://*.animekai.to/*', '*://animekai.bz/*'],
  },
  search: 'https://animekai.to/browser?keyword={searchtermPlus}',
  sync: {
    // Should work
    isSyncPage($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.isSyncPage';

      // Check if the current page is a watch page or a watch2gether page and return true if it is and false otherwise
      return (
        $c
          .url()
          .urlPart(3)
          .contains('watch')
          // .log(`${functionName} - Is Watch Page`)
          .run()
      );
    },
    // Should work
    getTitle($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getTitle';
      // Returns the title of the anime. Used for searching on MyAnimeList.
      return $c
        .coalesce(
          // Get the title from the page from attribute data-jp
          $c
            .querySelector('#main-entity .title')
            .getAttribute('data-jp') /* doesn't get attribute */
            // .log(`${functionName} - Title`)
            .run(),
          // (Empty fallback) If it's a watch page and the title in the page is not found,
          // return the title of the page without the 'Anime' and 'Watch Online Free - AnimeKAI' prefix
          // ()they have a lot of different titles so it doesn't really work for now)
          $c
            .if(
              // Check if the current URL is a watch page
              isWatch2Gether($c, functionName),
              // Should return nothing but can't
              $c
                .string()
                // .log(`${functionName} - Title not found in Watch2Gether page`)
                .run(),
              // Get the title from the anime page and removes the 'Anime' and 'Watch Online Free - AnimeKAI' affixes as a fallback
              $c
                .title()
                .regex(
                  // They have a lot of different titles so doesn't really work right now
                  '/^(Anime\\s*)?|(\\s*Watch Online Free - AnimeKAI\\s*)$/gi',
                )
                // .log(
                //   `${functionName} - (FALLBACK) Title not found, using alternative title if watch page`,
                // )
                .run(),
            )
            .run(),
        )
        .ifNotReturn(/* $c.log(`${functionName} - Title not found`).run() */)
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
      // Returns the identifier of the anime.
      return $c
        .if(
          // If the current page is a Watch2Gether page
          isWatch2Gether($c, functionName),
          // Get the identifier from overview url and get the last part of the URL with regex
          $c
            .this('sync.getOverviewUrl')
            .urlPart(4)
            .regex(idRegex)
            // .log(`${functionName} - id from Watch2Gether`)
            .run(),
          // Otherwise, get the identifier from the URL
          $c
            .url()
            .urlPart(4)
            .regex(idRegex)
            // .log(`${functionName} - id from URL`)
            .run(),
        )
        .run();
    },
    // Should work
    getOverviewUrl($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getOverviewUrl';
      // Returns the overview URL of the anime.
      return $c
        .if(
          // If the current page is a Watch2Gether page
          isWatch2Gether($c, functionName),
          // animekai.to + the URL from the Watch2Gether button
          $c
            .querySelector('#main-entity a.btn-primary')
            .getAttribute('href')
            .urlAbsolute()
            // .log(`${functionName} - Watch2Gether URL`)
            .run(),
          // Otherwise, return the canonical URL
          $c
            .querySelector('link[rel=canonical]')
            .getAttribute('href')
            // .log(`${functionName} - Canonical URL`)
            // If the Canonical URL is null or empty, get the current URL without query parameters
            .ifNotReturn(
              $c
                .url()
                .urlStrip()
                // .log(`${functionName} - Stripped URL`)
                .run(),
            )
            .run(),
        )
        .run();
    },
    // Should work
    getEpisode($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getEpisode';
      // Returns the episode number of the anime.
      return $c
        .if(
          // If the current page is a Watch2Gether page
          isWatch2Gether($c, functionName),
          // Return the episode number from the element with id 'cur-ep-num'
          $c
            .querySelector('#cur-ep-num')
            .getBaseText()
            // .log(`${functionName} - Watch2Gether episode`)
            .number()
            .run(),
          // Otherwise, get the episode number from the URL
          $c
            .querySelector('div.eplist a.active')
            .getAttribute('num')
            .number()
            // .log(`${functionName} - Episode`)
            .run(),
        )
        .ifNotReturn($c.log(`${functionName} - No episode found`).run())
        .run();
    },
    // Should work
    nextEpUrl($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.nextEpUrl';
      // Return next episode URL if it exists, otherwise return undefined
      return (
        $c
          .querySelector('div.eplist a.active')
          .parent()
          .next()
          .find('a')
          .getAttribute('href')
          // .log(`${functionName} - Next Episode`)
          .ifNotReturn(
            // If there is not next episode or is Watch2Gether page, return undefined
            undefined,
          )
          // .log(`${functionName} - No next episode found, returning undefined`)
          .run()
      );
    },
    // Should work
    getMalUrl($c) {
      // functionName is used for logging purposes
      const functionName = 'sync.getMalUrl';
      // #watch-page contains providers anime ids
      const watchPage = $c
        .querySelector('#watch-page')
        .ifNotReturn(/* $c.log('No id found').run() */);
      return $c
        .boolean(watchPage !== null && watchPage !== undefined)
        .ifThen(() => {
          const malId = watchPage.getAttribute('data-mal-id').string().run();
          if (malId) {
            return (
              $c
                .string('https://myanimelist.net/anime/')
                .concat(malId)
                // .log(`${functionName} - MAL URL`)
                .run()
            );
          }
          const alId = watchPage.getAttribute('data-al-id').string().run();
          if (alId) {
            return (
              $c
                .string('https://anilist.co/anime/')
                .concat(alId)
                // .log(`${functionName} - Anilist URL`)
                .run()
            );
          }
          return (
            $c
              .string('')
              // .log(`${functionName} - No MAL or Anilist ID found, returning empty string`)
              .run()
          );
        })
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#main-entity div.info').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div.eplist a').run();
    },
    elementUrl($c) {
      // functionName is used for logging purposes
      const functionName = 'list.elementUrl';
      return $c
        .getAttribute('href')
        .ifNotReturn(/* $c.log(`${functionName} - No URL found`).run() */)
        .run();
    },
    elementEp($c) {
      return $c.getAttribute('num').number().run();
    },
  },
  lifecycle: {
    // Checks when episode range changes in episode section to detect pagination changes
    // Example: 001-100 to 101-200
    listChange($c) {
      // functionName is used for logging purposes
      const functionName = 'lifecycle.listChange';

      return $c
        .detectChanges(
          $c
            .querySelector('#watch-page .btn.range-label.dropdown-arrow[data-bs-toggle]')
            .ifNotReturn($c.log(`${functionName} - No episode pagination button found`).run())
            .text()
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
    // When title changes trigger lifecycle events for SPA
    ready($c) {
      return $c.domReady().trigger().detectChanges($c.url().run(), $c.trigger().run()).run();
    },
    syncIsReady($c) {
      // functionName is used for logging purposes
      const functionName = 'lifecycle.syncIsReady';
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('#main-entity .title').boolean().run(),
              $c.querySelector('div.eplist a.active').boolean().run(),
            )
            .run(),
        )
        .log(`${functionName} - Title and episode list loaded`)
        .trigger()
        .detectChanges($c.url().run(), $c.trigger().run())
        .run();
    },
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
  },
};
