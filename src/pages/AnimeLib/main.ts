/* eslint-disable global-require */
import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';
import { Anime, getAnimeData, getEpisodeData, getEpisodesData } from './api';

let interval: number | NodeJS.Timeout;

const anime: Anime = {
  data: {
    id: 0,
    name: '',
    rus_name: '',
    eng_name: '',
    slug_url: '',
    cover: {
      default: '',
      thumbnail: '',
    },
  },
  player: {
    episode: 0,
    total: 0,
    season: 0,
    next: undefined,
  },
};

export const AnimeLib: pageInterface = {
  domain: 'https://anilib.me',
  languages: ['Russian'],
  name: 'AnimeLib',
  type: 'anime',
  getImage() {
    return anime.data.cover.default || anime.data.cover.thumbnail;
  },
  isSyncPage(url: string): boolean {
    return utils.urlPart(url, 6) !== '' && utils.urlPart(url, 4) === 'anime';
  },
  isOverviewPage(url: string): boolean {
    return utils.urlPart(url, 6) === '' && utils.urlPart(url, 4) === 'anime';
  },
  sync: {
    getTitle(url: string): string {
      return anime.data.eng_name || anime.data.name || anime.data.rus_name;
    },
    getIdentifier(url: string): string {
      return anime.data.id.toString();
    },
    getOverviewUrl(url: string): string {
      return utils.absoluteLink(`ru/anime/${anime.data.slug_url}`, AnimeLib.domain);
    },
    getEpisode(url: string): number {
      return anime.player.episode;
    },
    nextEpUrl(url: string): string | undefined {
      return anime.player.next;
    },
    getMalUrl(provider) {
      if (anime.data.shikimori_href) {
        const id = anime.data.shikimori_href.match(/\/[a-z]?(\d+)/);
        if (id) {
          return `https://myanimelist.net/anime/${id[1]}`;
        }
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return anime.data.eng_name || anime.data.name || anime.data.rus_name;
    },
    getIdentifier(url) {
      return anime.data.id.toString();
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
    getMalUrl(provider) {
      return AnimeLib.sync.getMalUrl!(provider);
    },
  },

  init(page: SyncPage) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() => {
      utils.fullUrlChangeDetect(check, true);
    });

    async function check() {
      page.reset();
      clearInterval(interval);
      if (
        !AnimeLib.isSyncPage(window.location.href) &&
        !AnimeLib.isOverviewPage!(window.location.href)
      )
        return;

      // NOTE - We are on the SYNC page
      if (AnimeLib.isSyncPage(window.location.href)) {
        await updateSyncPage();

        interval = utils.changeDetect(
          async () => {
            page.reset();
            await updateSyncPage();
            page.handlePage();
          },
          () => window.location.search,
          true,
        );
      }

      // NOTE - We are on the OVERVIEW page
      if (AnimeLib.isOverviewPage!(window.location.href)) {
        await updateOverviewPage();

        interval = utils.waitUntilTrue(
          () => {
            return j.$('.tabs-item').length;
          },
          () => {
            page.handlePage();
          },
          500,
        );
      }
    }
  },
};

async function updateOverviewPage() {
  const { data: animeData } = await getAnimeData(utils.urlPart(window.location.href, 5));
  anime.data = animeData;
}

async function updateSyncPage() {
  const animeId = utils.urlPart(window.location.href, 5);
  const { data: animeData } = await getAnimeData(animeId);
  anime.data = animeData;

  const { data: episodes } = await getEpisodesData(animeId);
  const episodeID = utils.urlParam(window.location.href, 'episode');
  if (episodeID) {
    const { data: episode } = await getEpisodeData(episodeID);

    anime.player.episode = Number(episode.number || episode.number_secondary);
    anime.player.season = Number(episode.season || 0);
    anime.player.total = episodes.length;

    const currentEpisode = episodes.find(e => e.id === Number(episodeID));
    if (currentEpisode) {
      const currentIndex = episodes.indexOf(currentEpisode);
      if (currentIndex + 1 < anime.player.total - 1) {
        const nextId = episodes[currentIndex + 1].id;
        anime.player.next = utils.absoluteLink(
          `ru/anime/${animeId}/watch?episode=${nextId}`,
          AnimeLib.domain,
        );
      }
    }
  }
}
