import { pageInterface } from '../pageInterface';

let jsonData;
let loadedTimeout;

export const Anistream: pageInterface = {
  name: 'Anistream',
  domain: 'https://Anistream.de',
  languages: ['German'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page && jsonData.page === 'episode';
  },
  isOverviewPage(url) {
    return jsonData.page && jsonData.page === 'anime';
  },
  sync: {
    getTitle(url) {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    getOverviewUrl(url) {
      return jsonData.series_url;
    },
    getEpisode(url) {
      return jsonData.episode;
    },
    nextEpUrl(url) {
      if (jsonData.next_episode_url) {
        return jsonData.next_episode_url;
      }
      return '';
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return Anistream.sync.getTitle(url);
    },
    getIdentifier(url) {
      return Anistream.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position)
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      return Anistream.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    utils.changeDetect(loaded, () => {
      const data = j.$('#syncData').text();
      if (!data) page.reset();
      return data;
    });

    function loaded() {
      clearTimeout(loadedTimeout);
      loadedTimeout = utils.waitUntilTrue(
        () => {
          if (j.$('#syncData').length) {
            jsonData = JSON.parse(j.$('#syncData').text());
            return true;
          }
          return false;
        },
        () => {
            page.handlePage();
          }
      )
    }
  }
};
