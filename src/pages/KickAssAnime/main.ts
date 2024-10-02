import { pageInterface } from '../pageInterface';

export const KickAssAnime: pageInterface = {
  name: 'KickAssAnime',
  domain: ['https://kickassanime.am', 'https://kaas.am'],
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
      return (window as any).KAA.data[0].episode.title;
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return `${KickAssAnime.domain}/${KickAssAnime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number((window as any).KAA.data[0].episode.episode_number);
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
