import { pageInterface } from '../pageInterface';

export const YayAnimes: pageInterface = {
  name: 'YayAnimes',
  domain: 'https://yayanimes.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (YayAnimes.sync.getEpisode(url) && !YayAnimes.isOverviewPage!(url)) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (
      YayAnimes.overview!.getTitle(url) &&
      YayAnimes.overview!.getIdentifier(url) &&
      j.$('div.boxAnimeSobre').length
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const content = j.$('#content > div:nth-child(1) > div > h1 > div > b > p > span').text();
      if (!content) return '';
      const title = content.replace(/–.*$/, '');
      return title.trim();
    },
    getIdentifier(url) {
      const href = YayAnimes.sync.getOverviewUrl(url);
      if (href) return href.split('/')[3];
      return '';
    },
    getOverviewUrl(url) {
      const href = j.$('div.pag_episodes > div:nth-child(2) > a').attr('href');
      if (href) return href;
      return '';
    },
    getEpisode(url) {
      const episodePart = url.split('/')[3];
      const temp = episodePart.match(/episodio-\d+/gi);
      if (!temp) {
        if (episodePart.includes('filme')) return 1;
        return NaN;
      }
      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$('div.pag_episodes > div:nth-child(3) > a').attr('href');
      if (href) return href;
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return YayAnimes.sync.getTitle(url);
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('#content > div.contentBox > div > div > div.boxAnimeSobre').after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
