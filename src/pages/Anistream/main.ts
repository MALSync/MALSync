import { pageInterface } from '../pageInterface';

let jsonData;

export const Anistream: pageInterface = {
  name: 'Anistream',
  domain: 'https://Anistream.de',
  languages: ['German'],
  type: 'anime',
  database: 'Anistream',
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

    let oldJson;

    j.$(document).ready(function () {
      setInterval(function () {
        utils.waitUntilTrue(
          function () {
            if (j.$('#syncData').length) {
              jsonData = JSON.parse(j.$('#syncData').text());
              if (JSON.stringify(jsonData) !== oldJson) {
                oldJson = JSON.stringify(jsonData);
                page.reset();
                return true;
              }
            }
            return false;
          },
          function () {
            page.handlePage();
          },
        );
      }, 1000);
    });
  },
};
