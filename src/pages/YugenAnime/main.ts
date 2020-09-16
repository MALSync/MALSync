import { pageInterface } from '../pageInterface';

let jsonData;

export const YugenAnime: pageInterface = {
  name: 'YugenAnime',
  domain: 'https://yugenani.me/',
  languages: ['English'],
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
      return YugenAnime.sync.getTitle(url);
    },
    getIdentifier(url) {
      return YugenAnime.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position)
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      return YugenAnime.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      utils.waitUntilTrue(
        function() {
          return j.$('#syncData').length;
        },
        function() {
          jsonData = JSON.parse(j.$('#syncData').text());
          page.handlePage();
        },
      );
    });
  },
};
