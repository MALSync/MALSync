import { pageInterface } from '../pageInterface';

let episode = 0;
let season = 0;
let hboMaxId: string | undefined;
let name = '';
let movie = false;
let nextEp = '';
let apiDataFetched = false;

export const HBOMax: pageInterface = {
  name: 'HBOMax',
  domain: 'https://www.max.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url: string) {
    if (url.includes('/video/') || url.includes('/watch/')) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle() {
      return name;
    },
    getIdentifier() {
      return `${hboMaxId}?s=${season}`;
    },
    getOverviewUrl() {
      if (window.location.href.includes('/video/')) {
        const parts = window.location.href.split('/video/');
        const id = parts[1].split('?')[0].split('/')[0];
        return `${HBOMax.domain}/series/${id}`;
      }
      return `${HBOMax.domain}/watch/${hboMaxId}`;
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
      const titleElement = j.$('[data-testid="player-ux-asset-title"]');
      if (titleElement && titleElement.text()) {
        return titleElement.text().trim();
      }
      return name;
    },
    getIdentifier() {
      if (movie) {
        return `${hboMaxId}?s=1`;
      }
      const seasonEpisodeElement = j.$('[data-testid="player-ux-season-episode"]');
      let seasonNum = 1;
      if (seasonEpisodeElement.length) {
        const seasonText = seasonEpisodeElement.text();
        const match = seasonText.match(/T(\d+)/);
        if (match) {
          seasonNum = parseInt(match[1]);
        }
      }
      return `${hboMaxId}?s=${seasonNum}`;
    },
    uiSelector(selector: string) {
      const titleContainer = j.$('[data-testid="player-ux-asset-title"]').parent();
      if (titleContainer.length) {
        titleContainer.after(j.html(selector));
      }
    },
  },
  init(page: any) {
    // eslint-disable-next-line no-void
    void api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    function tryExtractFromAPI(data: any): boolean {
      try {
        // Extract next episode info from API response
        if (data.data && data.data.length > 0) {
          const nextVideo = data.data[0];
          const attrs = nextVideo.attributes || {};
          const videoType = attrs.videoType || '';

          // Only process if it's an episode
          if (videoType === 'EPISODE') {
            // Try to find the route to the next episode
            const routes = (data.included || []).filter(
              (item: any) =>
                item.type === 'route' && item.attributes && item.attributes.canonical,
            );
            if (routes.length > 0) {
              const routeUrl = (routes[0] as any).attributes?.url;
              if (routeUrl) {
                nextEp = `${HBOMax.domain}${routeUrl}`;
                con.log('HBOMax - Next episode URL extracted from API:', nextEp);
                return true;
              }
            }
          }
        }
      } catch (e) {
        con.log('Could not extract next episode from API:', e);
      }
      return false;
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
            if (url && url.includes('nextVideos')) {
              const clonedResponse = response.clone();
              const data = await clonedResponse.json();
              tryExtractFromAPI(data);
            }
          } catch (e) {
            // Silent fail
          }
          return response;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fetch = interceptedFetch;
      } catch (e) {
        con.log('Could not setup API interceptor:', e);
      }
    }

    function extractFromDOM(): boolean {
      try {
        // Get title from page using HBO Max's test IDs
        const titleElement = j.$('[data-testid="player-ux-asset-title"]');
        con.log('HBOMax extractFromDOM() - Looking for title. Found:', titleElement.length);
        if (!titleElement.length) {
          con.log('HBOMax - Title element not found');
          return false;
        }

        name = titleElement.text().trim();
        con.log('HBOMax - Title extracted:', name);

        // Get episode and season info from season-episode element (DOM fallback)
        // Format: "T{season} Ep.{episode}:"
        const seasonEpisodeElement = j.$('[data-testid="player-ux-season-episode"]');
        const seasonEpisodeText = seasonEpisodeElement.text().trim();
        con.log('HBOMax - Season/Episode text:', seasonEpisodeText);

        if (seasonEpisodeText) {
          // Parse season from "T1 Ep.1:" format
          const seasonMatch = seasonEpisodeText.match(/T(\d+)/);
          if (seasonMatch) {
            season = parseInt(seasonMatch[1]);
          } else {
            season = 1;
          }

          // Parse episode from "T1 Ep.1:" format
          const episodeMatch = seasonEpisodeText.match(/Ep\.(\d+)/);
          if (episodeMatch) {
            episode = parseInt(episodeMatch[1]);
          } else {
            episode = 1;
          }
        } else {
          // If no season/episode info found, it's likely a movie
          episode = 1;
          season = 1;
          movie = true;
        }

        con.log(
          // eslint-disable-next-line max-len
          `HBOMax - Data extracted from DOM - Title: ${name}, Episode: ${episode}, Season: ${season}`,
        );
        return true;
      } catch (e) {
        con.error('HBOMax DOM extraction error:', e);
        return false;
      }
    }

    async function checkPage(): Promise<boolean> {
      try {
        // Extract ID from URL
        const url = window.location.href;
        let id: string | undefined;
        con.log('HBOMax checkPage() - URL:', url);

        if (url.includes('/video/')) {
          // Format: /video/[ID]/[ID]
          const [, videoPart] = url.split('/video/');
          if (videoPart) {
            // Get first ID segment
            [id] = videoPart.split('?')[0].split('/');
          }
          con.log('HBOMax - Extracted ID from /video/:', id);
        } else if (url.includes('/watch/')) {
          // Format: /watch/[ID]
          const [, watchPart] = url.split('/watch/');
          if (watchPart) {
            [id] = watchPart.split('?')[0].split('/');
          }
          con.log('HBOMax - Extracted ID from /watch/:', id);
        }

        if (!id) {
          con.log('HBOMax - No ID found');
          return false;
        }

        hboMaxId = id;

        // Extract metadata from DOM
        con.log('HBOMax - Calling extractFromDOM()');
        if (!extractFromDOM()) {
          con.log('HBOMax - extractFromDOM() failed');
          return false;
        }

        con.log(
          // eslint-disable-next-line max-len
          `HBOMax - Title: ${name}, Episode: ${episode}, Season: ${season}, ID: ${hboMaxId}, NextEp: ${nextEp}`,
        );
        return true;
      } catch (e) {
        con.error('HBOMax error:', e);
        return false;
      }
    }

    function startCheck() {
      con.log('HBOMax startCheck() called');
      $('html').addClass('miniMAL-hide');

      // Setup API interceptor to capture responses
      setupAPIInterceptor();

      if (window.location.href.includes('/video/') || window.location.href.includes('/watch/')) {
        con.log('HBOMax - URL matches /video/ or /watch/');
        utils.waitUntilTrue(
          function () {
            const titleElement = j.$('[data-testid="player-ux-asset-title"]');
            con.log('HBOMax - Looking for title element. Found:', titleElement.length);
            return titleElement.length > 0;
          },
          // eslint-disable-next-line func-names
          async function () {
            con.log('HBOMax - Title element found! Calling checkPage()');
            if (await checkPage()) {
              con.log('HBOMax - checkPage() returned true. Calling page.handlePage()');
              page.handlePage();
              $('html').removeClass('miniMAL-hide');
            } else {
              con.log('HBOMax - checkPage() returned false');
              $('html').removeClass('miniMAL-hide');
            }
          },
        );
      } else {
        con.log('HBOMax - URL does NOT match /video/ or /watch/. Current URL:', window.location.href);
      }
    }

    startCheck();

    utils.urlChangeDetect(function () {
      page.reset();
      con.log('HBOMax URL change');
      startCheck();
    });
  },
};
