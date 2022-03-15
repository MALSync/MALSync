import { pageInterface } from '../pageInterface';

export const Puray: pageInterface = {
  name: 'Puray',
  domain: 'https://puray.moe',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(url.split('/')[3] === 'watch');
  },
  isOverviewPage(url) {
    return Boolean(url.split('/')[3] === 'anime');
  },
  sync: {
    getTitle(url) {
      return j
        .$(
          '#root > main > div > div > div > div > div.mt-4.flex.flex-col.justify-between.xl\\:flex-row > div.mr-12.flex.flex-col > div > a > span',
        )
        .first()
        .text();
    },
    getIdentifier(url) {
      return j
        .$('#root > main > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div> a')
        .first()
        .prop('href')
        .split('/')[4];
    },
    getOverviewUrl(url) {
      return j
        .$('#root > main > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div> a')
        .first()
        .prop('href');
    },
    getEpisode(url) {
      return Number(
        j
          .$(
            '#root > main > div > div > div > div > div.mt-4.flex.flex-col.justify-between.xl\\:flex-row > div.mr-12.flex.flex-col > span',
          )
          .first()
          .text()
          .split('-')[0],
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.text-3xl').first().text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$(
        '#root > main > div:nth-child(1) > section > div > div > div:nth-child(2) > div:nth-child(4) > a',
      ).after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    utils.fullUrlChangeDetect(function () {
      page.reset();
      check();
    });
    function check() {
      utils.waitUntilTrue(
        function () {
          if (j.$('#spinner').length) {
            return false;
          }
          return true;
        },
        function () {
          page.handlePage();
        },
      );
    }
  },
};
