import { pageInterface } from '../pageInterface';

export const ReaperScans: pageInterface = {
  name: 'ReaperScans',
  domain: 'https://reaperscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5).startsWith('chapter');
  },
  isOverviewPage(url) {
    return !utils.urlPart(url, 5) && url.includes('/series/');
  },
  sync: {
    getTitle(url) {
      return j.$('h2').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('.fa-house').closest('a[href*="/series/"]').first().attr('href'),
        ReaperScans.domain,
      );
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
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('.fa-chevron-right').closest('a[href*="/series/"]').first().attr('href'),
        ReaperScans.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.grid a[href*="/series/"]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), ReaperScans.domain);
      },
      elementEp(selector) {
        return ReaperScans.sync.getEpisode(ReaperScans.overview!.list!.elementUrl!(selector));
      },
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
        if (ReaperScans.isSyncPage(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => ReaperScans.sync!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        } else if (ReaperScans.isOverviewPage!(window.location.href)) {
          checkInterval = utils.waitUntilTrue(
            () => ReaperScans.overview!.getTitle(window.location.href),
            () => page.handlePage(),
          );
        }
      });
    });

    utils.changeDetect(
      () => page.handleList(),
      () => j.$(ReaperScans.overview!.list!.elementsSelector()).text(),
    );
  },
};
