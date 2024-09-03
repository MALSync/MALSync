import { pageInterface } from '../pageInterface';

export const ScyllaScans: pageInterface = {
  name: 'ScyllaScans',
  domain: 'https://scyllacomics.xyz',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/').length - 1 === 5;
  },
  isOverviewPage(url) {
    return url.split('/').length - 1 === 4 && utils.urlPart(url, 3) === 'manga';
  },
  sync: {
    getTitle(url) {
      return j.$('h3').eq(0).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${ScyllaScans.domain}/manga/${utils.urlPart(url, 4)}`;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h2').eq(0).text().split('[')[0].trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('span').eq(1).after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      let checkInterval: NodeJS.Timer;

      utils.fullUrlChangeDetect(() => {
        page.reset();
        clearInterval(checkInterval);
        if (ScyllaScans.isSyncPage(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => ScyllaScans.sync!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        } else if (ScyllaScans.isOverviewPage!(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => ScyllaScans.overview!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        }
      });
    });
  },
};
