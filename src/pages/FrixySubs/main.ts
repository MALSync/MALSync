import { pageInterface } from '../pageInterface';

export const FrixySubs: pageInterface = {
  name: 'FrixySubs',
  domain: 'https://frixysubs.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'anime' && Boolean(utils.urlPart(url, 5));
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'anime' && Boolean(!utils.urlPart(url, 5));
  },
  sync: {
    getTitle(url) {
      return (
        j
          .$('.container .v-card__title')
          .first()
          .text()
          .trim()
          .replace(/-[^-]*$/, '')
          .trim() || ''
      );
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url.split('/').slice(0, 5).join('/');
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      const href = j.$('.mdi-skip-forward').closest('a').attr('href');
      return href ? utils.absoluteLink(href, FrixySubs.domain) : '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.data .v-card__title').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.data .v-card__title').first().after(j.html(selector));
    },
  },
  init(page) {
    page.handlePage();
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      utils.urlChangeDetect(() => check());
      check();
    });

    let debounce: NodeJS.Timer;

    function check() {
      page.reset();
      clearTimeout(debounce);
      if (FrixySubs.isSyncPage(page.url)) {
        debounce = utils.waitUntilTrue(
          () => FrixySubs.sync.getTitle(page.url),
          () => {
            page.handlePage();
          },
        );
      } else if (FrixySubs.isOverviewPage!(page.url)) {
        debounce = utils.waitUntilTrue(
          () => FrixySubs.overview!.getTitle(page.url),
          () => {
            page.handlePage();
          },
        );
      }
    }
  },
};
