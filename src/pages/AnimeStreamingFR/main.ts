import { pageInterface } from '../pageInterface';

let jsonData;

export const AnimeStreamingFR: pageInterface = {
  name: 'AnimeStreamingFR',
  domain: 'https://www.animestreamingfr.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.isStreaming;
  },
  sync: {
    getTitle(url) {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.id;
    },
    getOverviewUrl(url) {
      return jsonData.main_url;
    },
    getEpisode(url) {
      return jsonData.episode;
    },
    nextEpUrl(url) {
      if (jsonData.nextEpisode) {
        return jsonData.nextEpisode;
      }
      return '';
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      if (provider === 'ANILIST') {
        if (jsonData.anilist_id) return `https://anilist.co/anime/${jsonData.anilist_id}`;
      }
      return false;
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position)
        .first()
        .after(j.html(selector));
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
