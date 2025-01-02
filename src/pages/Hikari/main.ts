import { pageInterface } from '../pageInterface';

export const Hikari: pageInterface = {
  name: 'Hikari',
  domain: ['https://watch.hikaritv.xyz'],
  database: 'Hikari',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    const isWatchPage = utils.urlPart(url, 3) === 'watch';
    // sync page has an `eps` parameter denoting the current episode
    const hasEpNumber = utils.urlParam(url, 'eps') !== null;

    return isWatchPage && hasEpNumber;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'anime';
  },
  sync: {
    getTitle(url) {
      return j.$('.film-name a').first().text().trim();
    },
    getIdentifier(url) {
      return Hikari.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.film-name a').first().attr('href'), Hikari.domain);
    },
    getEpisode(url) {
      const epId = utils.urlParam(url, 'eps');
      if (!epId) return NaN;
      return Number(epId);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.film-name').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.film-name').first().prepend(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(function () {
      Hikari.domain = `${window.location.protocol}//${window.location.hostname}`;
      page.handlePage();

      utils.waitUntilTrue(
        () => j.$('#main-wrapper').length,
        () => page.handleList(),
      );

      j.$('#main-wrapper').click(function () {
        setTimeout(function () {
          page.handleList();
        }, 500);
      });
    });
  },
};
