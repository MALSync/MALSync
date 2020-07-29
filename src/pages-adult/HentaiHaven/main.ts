import { pageInterface } from '../../pages/pageInterface';

export const HentaiHaven: pageInterface = {
  name: 'HentaiHaven',
  domain: 'https://hentaihaven.org',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== null && j.$('h1.entry-title')[0] && j.$('div.hentaiha-post-tabs')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div > header > div > a').text();
    },
    getIdentifier(url) {
      const anchorHref = j.$('div > header > div > a').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('div > header > div > a').attr('href') || '';
    },
    getEpisode(url) {
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
    getTitle(url) {
      return j.$('h1.archive-title').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('div.archive-meta.category-meta')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] !== null && j.$('h1.entry-title')[0] && j.$('div.hentaiha-post-tabs')[0]) ||
        page.url.split('/')[3] === 'series'
      ) {
        page.handlePage();
      }
    });
  },
};
