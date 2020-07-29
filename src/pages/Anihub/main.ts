import { pageInterface } from '../pageInterface';

let jsonData;

export const Anihub: pageInterface = {
  name: 'Anihub',
  domain: 'https://anihub.tv',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.isStreaming;
  },
  sync: {
    getTitle(url) {
      return jsonData.animeName;
    },
    getIdentifier(url) {
      return jsonData.id;
    },
    getOverviewUrl(url) {
      return jsonData.overview_url;
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
      if (jsonData.mal_id && jsonData.mal_id !== '0') {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return Anihub.sync.getTitle(url);
    },
    getIdentifier(url) {
      return Anihub.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div.aniinfos > p > b').after(j.html(selector));
    },
    getMalUrl(provider) {
      return Anihub.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;
    let oldJson = '';

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          if (j.$('#syncData').length) {
            jsonData = JSON.parse(j.$('#syncData').text());
            if (
              jsonData.animeName &&
              !jsonData.animeName.toLowerCase().includes('carregando') &&
              JSON.stringify(jsonData) !== oldJson
            ) {
              oldJson = JSON.stringify(jsonData);
              return true;
            }
          }
          return false;
        },
        function() {
          if (
            Object.prototype.hasOwnProperty.call(jsonData, 'isStreaming') &&
            Object.prototype.hasOwnProperty.call(jsonData, 'id') &&
            Object.prototype.hasOwnProperty.call(jsonData, 'overview_url')
          ) {
            page.handlePage();
          }
        },
      );
    }
  },
};
