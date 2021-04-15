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
        .append(j.html(selector));
    },
  },
  init(page) {
    function checkPage() {
      page.reset();
      if (
        page.url.split('/').length > 3 &&
        page.url.split('/')[3] === 'anime' &&
        typeof page.url.split('/')[4] !== 'undefined' &&
        page.url.split('/')[4].length > 0
      ) {
        utils.waitUntilTrue(
          function() {
            return j.$('#syncData').length;
          },
          function() {
            const jsonText = j
              .$('#syncData')
              .text()
              .replace(/&quot;/g, '"');
            con.m('json').log(jsonText);
            jsonData = JSON.parse(jsonText);

            page.handlePage();
          },
        );
      }
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    checkPage();
    utils.urlChangeDetect(function() {
      checkPage();
    });
  },
};
