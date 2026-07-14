import { pageInterface } from '../pageInterface';

let episode = 0;
let season = 0;
let primeVideoId: string | undefined;
let name = '';
let movie = false;
let nextEp = '';
let apiDataFetched = false;

export const PrimeVideo: pageInterface = {
  name: 'PrimeVideo',
  domain: 'https://www.primevideo.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url: string) {
    // Prime Video pode abrir o player em /detail/ ou /watch/
    if (url.includes('/watch/') || url.includes('/detail/') || url.includes('/?')) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle() {
      return name;
    },
    getIdentifier() {
      return `${primeVideoId as string}?s=${season}`;
    },
    getOverviewUrl() {
      return `${PrimeVideo.domain}/detail/${primeVideoId}/`;
    },
    getEpisode() {
      return episode;
    },
    nextEpUrl() {
      return nextEp;
    },
  },
  overview: {
    getTitle() {
      const titleElement = j.$('[data-automation-id="dp-headline"]');
      if (titleElement && titleElement.text()) {
        return titleElement.text().trim();
      }
      return name;
    },
    getIdentifier() {
      if (movie) {
        return `${primeVideoId}?s=1`;
      }
      const seasonText = j.$('[data-testid="season-select"]').first().text();
      const seasonMatch = seasonText.match(/\d+/);
      const seasonNum = seasonMatch ? parseInt(seasonMatch[0]) : 1;
      return `${primeVideoId}?s=${seasonNum}`;
    },
    uiSelector(selector: string) {
      j.$('[data-automation-id="dp-headline"]').parent().after(j.html(selector));
    },
  },
  init(page: any) {
    // eslint-disable-next-line no-void
    void api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    function tryExtractFromAPI(data: any): boolean {
      try {
        if (!data.resources || !data.resources.catalogMetadataV2) {
          return false;
        }

        const catalog = data.resources.catalogMetadataV2.catalog;
        if (!catalog || catalog.type !== 'EPISODE') {
          return false;
        }

        // Extract from API
        name = catalog.seriesTitle || name;
        episode = catalog.episodeNumber || 1;
        season = catalog.seasonNumber || 1;
        movie = false;

        con.log(
          // eslint-disable-next-line max-len
          `PrimeVideo - Data extracted from API - Title: ${name}, Episode: ${episode}, Season: ${season}`,
        );
        return true;
      } catch (e) {
        con.log('Could not extract from API:', e);
        return false;
      }
    }

    function extractFromDOM(): boolean {
      try {
        // Get metadata from page
        const titleElement = j.$('.atvwebplayersdk-title-text');
        if (!titleElement.length) {
          return false;
        }

        name = titleElement.text().trim();

        // Extract episode and season from episode info
        // Format: "T{season} Ep.{episode} {title}"
        const episodeInfoElement = j.$('.atvwebplayersdk-episode-info');
        const episodeInfoText = episodeInfoElement.text().trim();

        if (episodeInfoText) {
          // Parse season from "T1 Ep.1" format
          const seasonMatch = episodeInfoText.match(/T(\d+)/);
          if (seasonMatch) {
            season = parseInt(seasonMatch[1]);
          } else {
            season = 1;
          }

          // Parse episode from "T1 Ep.1" format
          const episodeMatch = episodeInfoText.match(/Ep\.(\d+)/);
          if (episodeMatch) {
            episode = parseInt(episodeMatch[1]);
          } else {
            episode = 1;
          }
        } else {
          // If no episode info found, it's likely a movie
          episode = 1;
          season = 1;
          movie = true;
        }

        con.log(
          // eslint-disable-next-line max-len
          `PrimeVideo - Data extracted from DOM - Title: ${name}, Episode: ${episode}, Season: ${season}`,
        );
        return true;
      } catch (e) {
        con.error('PrimeVideo DOM extraction error:', e);
        return false;
      }
    }

    function setupAPIInterceptor(): void {
      try {
        // Override fetch to intercept API responses
        const originalFetch = window.fetch;
        // eslint-disable-next-line no-inner-declarations
        async function interceptedFetch(input: any, init?: any) {
          const response = await originalFetch(input, init);
          try {
            let url: string | undefined;
            if (typeof input === 'string') {
              url = input;
            } else if (input && typeof input === 'object' && input.url) {
              url = input.url;
            }
            if (url && url.includes('cdp/lumina/playerChromeResources')) {
              const clonedResponse = response.clone();
              const data = await clonedResponse.json();
              if (tryExtractFromAPI(data)) {
                apiDataFetched = true;
              }
            }
          } catch (e) {
            // Silent fail - API interception is optional
          }
          return response;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fetch = interceptedFetch;
      } catch (e) {
        con.log('Could not setup API interceptor:', e);
      }
    }

    async function checkPage(): Promise<boolean> {
      try {
        // Extract ID from URL
        const urlParts = window.location.href.split('/');
        let watchIndex = urlParts.indexOf('watch');
        
        // If not /watch/, try /detail/
        if (watchIndex === -1) {
          watchIndex = urlParts.indexOf('detail');
        }

        if (watchIndex === -1 || !urlParts[watchIndex + 1]) {
          return false;
        }

        primeVideoId = urlParts[watchIndex + 1];

        // Try API first (if already fetched)
        if (apiDataFetched) {
          nextEp = '';
          con.log(
            // eslint-disable-next-line max-len
            `PrimeVideo - Title: ${name}, Episode: ${episode}, Season: ${season}, ID: ${primeVideoId}`,
          );
          return true;
        }

        // Fallback to DOM extraction
        if (!extractFromDOM()) {
          return false;
        }

        nextEp = '';

        con.log(
          // eslint-disable-next-line max-len
          `PrimeVideo - Title: ${name}, Episode: ${episode}, Season: ${season}, ID: ${primeVideoId}`,
        );
        return true;
      } catch (e) {
        con.error('PrimeVideo error:', e);
        return false;
      }
    }

    function startCheck() {
      $('html').addClass('miniMAL-hide');

      // Setup API interceptor to capture responses
      setupAPIInterceptor();

      // Both /watch/ and /detail/ pages can have players
      utils.waitUntilTrue(
        function () {
          return j.$('.atvwebplayersdk-title-text').length > 0 || apiDataFetched;
        },
        // eslint-disable-next-line func-names
        async function () {
          if (await checkPage()) {
            page.handlePage();
            $('html').removeClass('miniMAL-hide');
          }
        },
      );
    }

    startCheck();

    utils.urlChangeDetect(function () {
      page.reset();
      con.log('PrimeVideo URL change');
      startCheck();
    });
  },
};
