import { pageInterface } from '../pageInterface';

export const Puray: pageInterface = {
  name: 'Puray',
  domain: 'https://puray.moe',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return url.split('/')[3] === 'watch' && !Number.isNaN(Puray.sync.getEpisode(url));
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('span.text-sm')
        .first()
        .text()
        .replace(/\(.*?\)/g, '')
        .trim();
    },
    getIdentifier(url) {
      return Puray.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return j.$('span.text-sm').first().parent().prop('href');
    },
    getEpisode(url) {
      return Number(j.$('span.text-lg').first().text().split('-')[0]);
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
