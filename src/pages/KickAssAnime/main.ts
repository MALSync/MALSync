import { pageInterface } from './../pageInterface';

export const KickAssAnime: pageInterface = {
  name: 'KickAssAnime',
  domain: 'https://www.kickassanime.rs',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[5] === null) {
      return false;
    } else {
      return true;
    }
  },
  sync: {
    getTitle: function(url) {
      return utils.getBaseText($('#animeInfoTab > a'));
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return `${KickAssAnime.domain}/anime/${KickAssAnime.sync.getIdentifier(
        url,
      )}`;
    },
    getEpisode: function(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('h1.title').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('div.anime-info.border.rounded.mb-3').first());
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
