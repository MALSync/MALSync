/* eslint-disable global-require */
import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';
import { Anime, Episode, Episodes, getAnimeData, getEpisodeData, getEpisodesData } from './api';

let interval: number | NodeJS.Timeout;

const anime: Anime = {
  data: {
    id: 0,
    name: '',
    rus_name: '',
    eng_name: '',
    slug_url: '',
    cover: {
      default: undefined,
      thumbnail: undefined,
    },
  },
  player: {
    episode: 1,
    total: 1,
    season: 1,
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
        utils.waitUntilTrue(
          () => utils.urlParam(window.location.href, 'episode'),
          async () => {
            await updateSyncPage();
            await page.handlePage();

            interval = utils.changeDetect(
              async () => {
                page.reset();
                await updateSyncPage();
                await page.handlePage();
              },
              () => window.location.search,
            );
          },
          100,
        );
      }

      // NOTE - We are on the OVERVIEW page
      if (AnimeLib.isOverviewPage!(window.location.href)) {
        await updateOverviewPage();

        interval = utils.waitUntilTrue(
          () => j.$('.tabs-item').length,
          () => page.handlePage(),
          500,
        );
      }
    }
  },
};

async function updateOverviewPage() {
  const animeSlug = utils.urlPart(window.location.href, 5);
  const data = await getAnimeData(animeSlug);
  if (data) {
    anime.data = data.data;
  } else {
    const idRegex = animeSlug.match(/(\d+)/);
    const animeId = Number(idRegex ? idRegex[0] : 0);
    anime.data.id = animeId;
    anime.data.slug_url = animeSlug;
    const metadataJson = j.$('script[type="application/ld+json"]').text();
    const animeMetadata = metadataJson ? JSON.parse(metadataJson)[1] : null;
    if (animeMetadata) {
      anime.data.rus_name = animeMetadata.name || animeMetadata.headline || '';
      anime.data.eng_name = animeMetadata.alternativeHeadline[0] || '';
      anime.data.cover.default = animeMetadata.image || '';
    } else {
      anime.data.rus_name = j.$('.container h1').text() || '';
      anime.data.eng_name = j.$('.container h2').text() || '';
      anime.data.cover.default = j.$('.cover__img').attr('src') || '';
    }
  }
}

async function updateSyncPage() {
  const animeSlug = utils.urlPart(window.location.href, 5);
  const idRegex = animeSlug.match(/(\d+)/);
  const animeId = Number(idRegex ? idRegex[0] : 0);
  const currentEpisodeButton = getCurrentEpisodeButton();
  const episodeID = utils.urlParam(window.location.href, 'episode') || '0';

  const animeData = await getAnimeData(animeSlug);
  const episodesData = await getEpisodesData(animeSlug);
  const episodeData = await getEpisodeData(episodeID);

  const haveAnimeData = !!animeData;
  const haveEpisodesData = !!episodesData;
  const haveEpisodeData = !!episodeData;

  if (haveAnimeData) {
    getAnimeDataAPI(animeData);
  } else {
    getAnimeDataNoAPI(animeSlug, animeId);
    if (!haveEpisodesData) {
      getTotalEpisodesNoAPI();
    }
  }
  if (haveEpisodesData) {
    getNextEpisodeAPI(episodesData);
    getTotalEpisodesAPI(undefined, episodesData);
  } else {
    getNextEpisodeNoAPI(currentEpisodeButton, animeId);
    if (haveAnimeData) {
      getTotalEpisodesAPI(animeData);
    }
  }
  if (haveEpisodeData) {
    getSeasonAPI(episodeData);
    getCurrentEpisodeAPI(episodeData);
  } else {
    getCurrentEpisodeNoAPI(currentEpisodeButton);
    getSeasonNoAPI();
  }
}

function getCurrentEpisodeButton() {
  const btns = j.$('[data-scroll-id]');
  for (let i = 0; i < btns.length; i++) {
    const btn = btns[i];
    if (btn.classList.length > 1) {
      return j.$(btn);
    }
  }
  return undefined;
}

function getTotalEpisodesNoAPI() {
  const totalEpisodes = j.$('[data-scroll-id]').length;
  anime.player.total = totalEpisodes;
  return anime.player.total;
}
function getTotalEpisodesAPI(anime_data?: Anime, episodes_data?: Episodes) {
  if (anime_data) {
    anime.player.total =
      anime_data.data.items_count!.total || anime_data.data.items_count!.uploaded;
  }
  if (episodes_data) {
    anime.player.total = episodes_data.data.length;
  }
  return anime.player.total || 0;
}
function getCurrentEpisodeNoAPI(currentEpisodeButton: JQuery<HTMLElement> | undefined) {
  if (currentEpisodeButton) {
    anime.player.episode = Number(currentEpisodeButton.text().split(' ')[0]);
  }
}
function getCurrentEpisodeAPI(episode_data: Episode) {
  anime.player.episode = Number(episode_data.data.number || 1);
}
function getNextEpisodeNoAPI(
  currentEpisodeButton: JQuery<HTMLElement> | undefined,
  animeId: number,
) {
  if (currentEpisodeButton) {
    const nextEpisodeButton = currentEpisodeButton.next();
    if (nextEpisodeButton && nextEpisodeButton !== currentEpisodeButton) {
      anime.player.next = window.location.href.replace(
        animeId.toString(),
        nextEpisodeButton.attr('data-scroll-id') || '',
      );
    }
  }
}
function getNextEpisodeAPI(episodes_data: Episodes) {
  const animeSlug = utils.urlPart(window.location.href, 5);
  const episodeID = utils.urlParam(window.location.href, 'episode');
  const currentEpisode = episodes_data.data.find(e => e.id === Number(episodeID));
  if (currentEpisode) {
    const currentIndex = episodes_data.data.indexOf(currentEpisode);
    if (currentIndex + 1 < getTotalEpisodesAPI(undefined, episodes_data) - 1) {
      const nextId = episodes_data.data[currentIndex + 1].id;
      anime.player.next = utils.absoluteLink(
        `ru/anime/${animeSlug}/watch?episode=${nextId}`,
        AnimeLib.domain,
      );
    }
  }
}
function getSeasonNoAPI() {
  anime.player.season = 1;
}
function getSeasonAPI(episode_data: Episode) {
  anime.player.season = Number(episode_data.data.season || 1);
}
function getAnimeDataNoAPI(animeSlug: string, animeId: number) {
  anime.data.rus_name = j.$('h1 a').text();
  anime.data.id = animeId;
  anime.data.slug_url = animeSlug;
  anime.data.cover.default = j.$('.cover img').first().attr('src') || '';
}
function getAnimeDataAPI(anime_data: Anime) {
  anime.data = anime_data.data;
}
