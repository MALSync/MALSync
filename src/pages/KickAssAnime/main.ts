import { pageInterface } from '../pageInterface';

export const KickAssAnime: pageInterface = {
  name: 'KickAssAnime',
  domain: 'https://kaas.am',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(utils.urlPart(url, 4));
  },
  isOverviewPage(url) {
    return Boolean($('.banner-section').length);
  },
  sync: {
    getTitle(url) {
      return $('.v-card__title > span').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return `${KickAssAnime.domain}/${KickAssAnime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const epText = $('.v-card__title > .text-overline').first().text();

      const epParts = epText.match(/episode (\d+)/im);

      if (!epParts) return NaN;

      return Number(epParts[1]);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.anime-info-card .v-card__title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('.anime-info-card .v-card__text').first().prepend(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      let until: NodeJS.Timer;

      utils.changeDetect(
        () => {
          check();
        },
        () => j.$('.v-card__title').text(),
      );

      check();

      function check() {
        clearInterval(until);
        until = utils.waitUntilTrue(
          () =>
            KickAssAnime.sync.getTitle(window.location.href) ||
            KickAssAnime.overview!.getTitle(window.location.href),
          () => {
            page.reset();
            page.handlePage();
          },
        );
      }
    });
  },
};
