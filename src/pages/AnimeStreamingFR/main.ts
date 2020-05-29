import { pageInterface } from '../pageInterface';

let jsonData;

export const AnimeStreamingFR: pageInterface = {
  name: 'AnimeStreamingFR',
  domain: 'https://www.animestreamingfr.fr',
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
      if(provider === "MAL"){
        if (jsonData.mal_id)
          return `https://myanimelist.net/anime/${jsonData.mal_id}`;
        else
          return false;
      }else if(provider === "ANILIST") {
        if (jsonData.anilist_id)
          return `https://anilist.co/anime/${jsonData.anilist_id}`;
        else
          return false;
      }
      return false;
    },
    uiSelector(selector) {
      selector.insertAfter(j.$(jsonData.selector_position).first());
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
