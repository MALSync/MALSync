import { SafeError } from '../../utils/errors';
import { pageInterface } from '../pageInterface';

export const BilibiliComics: pageInterface = {
  name: 'BilibiliComics',
  domain: 'https://www.bilibilicomics.com/',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(utils.urlPart(url, 3) !== 'detail' && parseInt(utils.urlPart(url, 4)));
  },
  isOverviewPage(url) {
    return Boolean(utils.urlPart(url, 3) === 'detail' && utils.urlPart(url, 4));
  },
  sync: {
    getTitle(url) {
      return j
        .$('.manga-title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.manga-title').attr('href'), BilibiliComics.domain);
    },
    getEpisode(url) {
      const ep = Number(
        j
          .$('.read-nav .episode')
          .text()
          .trim(),
      );
      if (Number.isNaN(ep)) {
        throw new SafeError('Cannot find episode number');
      }
      return ep;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.manga-title')
        .first()
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.author-name, .manga-title-container')
        .last()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.list-data > button');
      },
      elementEp(selector) {
        return Number(
          selector
            .find('.short-title')
            .first()
            .text(),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (BilibiliComics.isSyncPage(page.url)) {
        utils.waitUntilTrue(
          () =>
            BilibiliComics.sync.getTitle(page.url) &&
            j
              .$('.read-nav .episode')
              .text()
              .trim() !== '--',
          () => page.handlePage(),
        );
      } else if (BilibiliComics.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          () => BilibiliComics.overview!.getTitle(page.url),
          () => page.handlePage(),
        );
      }
    });
  },
};
