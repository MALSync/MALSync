import { pageInterface } from '../pageInterface';

export const YayAnimes: pageInterface = {
  name: 'YayAnimes',
  domain: 'https://yayanimes.net',
  type: 'anime',
  isSyncPage(url) {
    if (url.includes('episodio')) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const content = j.$('#content > div:nth-child(1) > div > h1 > div > b > p > span').text();
      const title = content.replace(/–.*$/, '');
      return title.trim();
    },
    getIdentifier(url) {
      return url.split('/')[3];
    },
    getOverviewUrl(url) {
      return `${YayAnimes.domain}/${YayAnimes.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      if (url.includes('filme')) {
        return 1;
      }
      const ep = Number(
        j
          .$('#content > div:nth-child(1) > div > h1 > div > b > p > span')
          .text()
          .match(/\d+$/),
      );
      return ep;
    },
  },
  overview: {
    getTitle(url) {
      return YayAnimes.sync.getTitle(url);
    },
    getIdentifier(url) {
      return YayAnimes.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      selector.insertAfter('#content > div.contentBox > div > div > div.boxAnimeSobre');
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    utils.fullUrlChangeDetect(function() {
      page.reset();
      page.handlePage();
    });
  },
};
