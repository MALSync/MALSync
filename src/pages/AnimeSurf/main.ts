import { pageInterface } from '../pageInterface';

function getAnimeId(url: string): string {
  return utils.urlPart(url, 4);
}

function getLdJson(type: string): Record<string, any> | null {
  let result: Record<string, any> | null = null;
  j.$('script[type="application/ld+json"]').each(function () {
    try {
      const data = JSON.parse(j.$(this).text());
      if (data['@type'] === type) {
        result = data;
        return false;
      }
    } catch (e) {
      /* ignore invalid json */
    }
  });
  return result;
}

function hasMalSyncTitle(): boolean {
  return Boolean(j.$('a[mal_sync="title"]').text().trim());
}

function isPageReady(url: string): boolean {
  if (hasMalSyncTitle()) return true;

  const section = utils.urlPart(url, 3);
  const isSync = section === 'watch' || section === 'embed' || section === 'watchparty';
  const isOverview = section === 'anime' && Boolean(utils.urlPart(url, 4));

  if (isSync) {
    const title = j.$('main h1').first().text().trim();
    return Boolean(title && title !== 'Ładowanie...');
  }

  if (isOverview) {
    return Boolean(j.$('h1.text-3xl').first().text().trim());
  }

  return false;
}

export const AnimeSurf: pageInterface = {
  name: 'AnimeSurf',
  domain: 'https://anime.surf',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    const section = utils.urlPart(url, 3);
    return section === 'watch' || section === 'embed' || section === 'watchparty';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'anime' && Boolean(utils.urlPart(url, 4));
  },
  sync: {
    getTitle(url) {
      const malSyncTitle = j.$('a[mal_sync="title"]').text().trim();
      if (malSyncTitle) return malSyncTitle;

      const title = j.$('main h1').first().text().trim();
      if (title && title !== 'Ładowanie...') return title;

      const episodeLd = getLdJson('TVEpisode');
      if (episodeLd?.partOfSeries?.name) return episodeLd.partOfSeries.name;

      const match = document.title.match(/Oglądaj (.+?) Odcinek/i);
      return match ? match[1].trim() : '';
    },
    getIdentifier(url) {
      return getAnimeId(url);
    },
    getOverviewUrl(url) {
      const href = j.$('a[mal_sync="title"]').attr('href');
      if (href) return utils.absoluteLink(href, AnimeSurf.domain);

      return `${AnimeSurf.domain}/anime/${getAnimeId(url)}`;
    },
    getEpisode(url) {
      const malSyncEpisode = j.$('[mal_sync="episode"]').first().text().trim();
      if (malSyncEpisode) return Number(malSyncEpisode);

      const epParam = utils.urlParam(url, 'episode');
      if (epParam) return Number(epParam);

      const episodeLd = getLdJson('TVEpisode');
      if (episodeLd?.episodeNumber) return Number(episodeLd.episodeNumber);

      const match = j.$('main h2 span').first().text().match(/Odc\.\s*(\d+)/);
      return match ? Number(match[1]) : 1;
    },
    nextEpUrl(url) {
      const nextEpisode = AnimeSurf.sync.getEpisode(url) + 1;
      const nextUrl = new URL(url);
      nextUrl.pathname = `/watch/${getAnimeId(url)}`;
      nextUrl.searchParams.set('episode', String(nextEpisode));
      return nextUrl.href;
    },
    getMalUrl(provider) {
      const malID = j.$('span[mal_sync="mal_id"]').attr('mal_sync_mal_id');
      if (malID && provider === 'MAL') {
        return `https://myanimelist.net/anime/${malID}`;
      }

      const anilistID = j.$('span[mal_sync="anilist_id"]').attr('mal_sync_anilist_id');
      if (anilistID && provider === 'ANILIST') {
        return `https://anilist.co/anime/${anilistID}`;
      }

      const id = getAnimeId(window.location.href);
      if (id.startsWith('mal-') && provider === 'MAL') {
        return `https://myanimelist.net/anime/${id.slice(4)}`;
      }

      if (/^\d+$/.test(id) && provider === 'ANILIST') {
        return `https://anilist.co/anime/${id}`;
      }

      return false;
    },
  },
  overview: {
    getTitle(url) {
      const malSyncTitle = j.$('a[mal_sync="title"]').text().trim();
      if (malSyncTitle) return malSyncTitle;

      const title = j.$('h1.text-3xl').first().text().trim();
      if (title) return title;

      const seriesLd = getLdJson('TVSeries');
      if (seriesLd?.name) return seriesLd.name;

      const match = document.title.match(/^(.+?)\s*\|/);
      return match ? match[1].trim() : '';
    },
    getIdentifier(url) {
      return getAnimeId(url);
    },
    uiSelector(selector) {
      const info = j.$('div[mal_sync="info"]');
      if (info.length) {
        info.after(j.html(selector));
        return;
      }

      j.$('h1.text-3xl').first().after(j.html(selector));
    },
    getMalUrl(provider) {
      return AnimeSurf.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        const malSyncEpisodes = j.$('div[mal_sync="episodes"]');
        if (malSyncEpisodes.length) return malSyncEpisodes;

        return j.$('a[href*="/watch/"][href*="episode="]');
      },
      elementUrl(selector) {
        const malSyncLink = j.$(selector).find('a[href]').first().attr('href');
        if (malSyncLink) return utils.absoluteLink(malSyncLink, AnimeSurf.domain);

        return utils.absoluteLink(j.$(selector).attr('href'), AnimeSurf.domain);
      },
      elementEp(selector) {
        const malSyncEpisode = j.$(selector).find('[mal_sync="episode"]').first().text().trim();
        if (malSyncEpisode) return Number(malSyncEpisode);

        const href = j.$(selector).attr('href') || '';
        const ep = utils.urlParam(href, 'episode');
        if (ep) return Number(ep);

        const match = j.$(selector).text().match(/Odcinek\s+(\d+)/i);
        return match ? Number(match[1]) : NaN;
      },
      paginationNext() {
        const nextBtn = j.$('a[aria-label="Go to next page"]');
        if (!nextBtn.length || nextBtn.hasClass('pointer-events-none')) return false;
        nextBtn[0].click();
        return true;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let debounce: NodeJS.Timer;

    function check() {
      page.reset();
      clearTimeout(debounce);

      if (AnimeSurf.isSyncPage(page.url) || AnimeSurf.isOverviewPage!(page.url)) {
        debounce = utils.waitUntilTrue(
          () => isPageReady(page.url),
          () => {
            page.handlePage();
          },
        );
      }
    }

    page.handlePage();
    j.$(document).ready(function () {
      utils.urlChangeDetect(() => check());
      check();
    });
  },
};
