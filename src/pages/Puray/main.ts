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
    return Boolean(url.split('/')[3] === 'anime');
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
  overview: {
    getTitle(url) {
      return j
        .$('div.text-3xl')
        .first()
        .text()
        .replace(/\(.*?\)/g, '')
        .trim();
    },
    getIdentifier(url) {
      return Puray.overview!.getTitle(url);
    },
    uiSelector(selector) {
      if (j.$('#headlessui-switch-12').length) {
        j.$('#headlessui-switch-12').after(j.html(selector));
      } else {
        j.$('div.text-left > div.items-center > a').first().after(j.html(selector));
      }
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
