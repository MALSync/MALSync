import { pageInterface } from '../pageInterface';

export const TempleScan: pageInterface = {
  name: 'TempleScan',
  domain: 'https://templescan.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5).includes('chapter-');
  },
  isOverviewPage(url) {
    return url.split('/').length - 1 === 4;
  },
  sync: {
    getTitle(url) {
      return j.$('span').eq(0).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${TempleScan.domain}/comic/${utils.urlPart(url, 4)}`;
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
      return j.$('h1').eq(1).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1').eq(1).after(j.html(selector));
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
        if (TempleScan.isSyncPage(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => TempleScan.sync!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        } else if (TempleScan.isOverviewPage!(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => TempleScan.overview!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        }
      });
    });
  },
};
