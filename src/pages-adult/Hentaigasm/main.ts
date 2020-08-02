import { pageInterface } from '../../pages/pageInterface';

export const Hentaigasm: pageInterface = {
  name: 'Hentaigasm',
  domain: 'http://hentaigasm.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (
      url.split('/')[6] !== null &&
      j.$('#extras > h4:nth-child(2) > a')[0] &&
      j.$('div.entry-content.rich-content')[0]
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1#title')
        .text()
        .replace(/\d+ (subbed|raw)/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return url
        .split('/')[6]
        .replace(/-\d*-(subbed|raw)/gim, '')
        .trim();
    },
    getOverviewUrl(url) {
      return j.$('#extras > h4:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[6];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-\d+-(subbed|raw)/gim);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#content > div.loop-header > h1 > em').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('div.loop-actions')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[6] !== null &&
          j.$('#extras > h4:nth-child(2) > a')[0] &&
          j.$('div.entry-content.rich-content')[0]) ||
        page.url.split('/')[3] === 'hentai'
      )
        page.handlePage();
    });
  },
};
