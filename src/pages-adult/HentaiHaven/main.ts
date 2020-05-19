import { pageInterface } from './../../pages/pageInterface';

export const HentaiHaven: pageInterface = {
  name: 'HentaiHaven',
  domain: 'https://hentaihaven.org',
  type: 'anime',
  isSyncPage: function(url) {
    if (
      url.split('/')[3] !== null &&
      j.$('h1.entry-title')[0] &&
      j.$('div.hentaiha-post-tabs')[0]
    ) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('div > header > div > a').text();
    },
    getIdentifier: function(url) {
      const anchorHref = j.$('div > header > div > a').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return j.$('div > header > div > a').attr('href') || '';
    },
    getEpisode: function(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-episode-\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('h1.archive-title').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('div.archive-meta.category-meta').first());
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
      if (
        (page.url.split('/')[3] !== null &&
          j.$('h1.entry-title')[0] &&
          j.$('div.hentaiha-post-tabs')[0]) ||
        page.url.split('/')[3] === 'series'
      ) {
        page.handlePage();
      }
    });
  },
};
