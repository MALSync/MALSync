import { pageInterface } from '../pageInterface';

export const VortexScans: pageInterface = {
  name: 'VortexScans',
  domain: 'https://vortexscans.org',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5).startsWith('chapter-');
  },
  isOverviewPage(url) {
    return url.split('/').length - 1 === 4 && utils.urlPart(url, 3) === 'series';
  },
  sync: {
    getTitle(url) {
      return document.title.trim().split(' Chapter')[0];
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${VortexScans.domain}/series/${utils.urlPart(url, 4)}`;
    },
    getEpisode(url) {
      let temp = 0;

      const titlePart = document.title.match(/chapter (\d+)/i);

      if (titlePart && titlePart[1]) {
        temp = Number(titlePart[1]);
      }

      if (!temp) {
        const episodePart = utils.urlPart(url, 5).match(/chapter-(\d+)/i);
        if (episodePart) temp = Number(episodePart[1]);
      }

      if (!temp) return 0;

      return temp;
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1[itemprop="name"]').eq(0).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1[itemprop="name"]').eq(0).after(j.html(selector));
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
        if (VortexScans.isSyncPage(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => VortexScans.sync!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        } else if (VortexScans.isOverviewPage!(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => VortexScans.overview!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        }
      });
    });
  },
};
