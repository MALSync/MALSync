import { pageInterface } from '../pageInterface';

export const Hikari: pageInterface = {
  name: 'Hikari',
  domain: ['watch.hikaritv.xyz'],
  database: 'Hikari',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    // sync page has an `eps` parameter denoting the current episode
    return utils.urlPart(url, 2) === 'watch' && utils.urlParam(url, 'eps') !== null;
  },
  isOverviewPage(url) {
    // TODO
    return utils.urlPart(url, 2) === 'anime' && j.$('.main-wrapper').length > 0;
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
      return j.$('.anime_info_body_bg > h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.anime_info_body').first().prepend(j.html(selector));
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
