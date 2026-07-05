import { pageInterface } from '../pageInterface';

export const Aniwave: pageInterface = {
  name: 'Aniwave',
  domain: ['https://aniwaves.ru'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(utils.urlPart(url, 5));
  },
  isOverviewPage(url) {
    return Boolean(utils.urlPart(url, 4)) && !utils.urlPart(url, 5);
  },
  sync: {
    getTitle(url) {
      // The site bakes the episode name into the h1 on sync pages
      // (e.g. "One Piece Episode 2 - Enter the Great Swordsman!"),
      // so strip that suffix to get the plain series title back.
      return $('h1.title')
        .first()
        .text()
        .trim()
        .replace(/\s+Episode\s+\d+.*$/i, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${Aniwave.domain}/watch/${Aniwave.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const epPart = utils.urlPart(url, 5);

      const epParts = epPart.match(/ep-(\d+)/i);

      if (!epParts) return NaN;

      return Number(epParts[1]);
    },
  },
  overview: {
    getTitle(url) {
      return $('h1.title').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.info').first().prepend(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(function () {
      utils.urlChangeDetect(() => {
        page.reset();
        page.handlePage();
      });

      utils.waitUntilTrue(
        () => Boolean($('h1.title').length),
        () => {
          page.handlePage();
        },
      );
    });
  },
};
