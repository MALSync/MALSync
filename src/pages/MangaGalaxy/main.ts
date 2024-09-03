import { pageInterface } from '../pageInterface';

export const MangaGalaxy: pageInterface = {
  name: 'MangaGalaxy',
  domain: 'https://mangagalaxy.net',
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
      let temp = '';
      temp = j.$('div').eq(9).text().trim();
      return temp.slice(0, temp.lastIndexOf(' ') - 8);
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${MangaGalaxy.domain}/series/${utils.urlPart(url, 4)}`;
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
      return j.$('h1').eq(0).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1').eq(0).after(j.html(selector));
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
        if (MangaGalaxy.isSyncPage(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => MangaGalaxy.sync!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        } else if (MangaGalaxy.isOverviewPage!(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => MangaGalaxy.overview!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        }
      });
    });
  },
};
