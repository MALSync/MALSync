import { pageInterface } from '../pageInterface';

export const Puray: pageInterface = {
  name: 'Puray',
  domain: 'https://puray.moe',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return (
      url.split('/')[3] === 'watch' &&
      j.$('span.text-lg').first().text().split('-')[0].trim() !== 'SP'
    );
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('[href^="/anime/"]')
        .first()
        .text()
        .replace(/\(.*?\)/g, '')
        .trim();
    },
    getIdentifier(url) {
      return Puray.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return j.$('[href^="/anime/"]').first().prop('href');
    },
    getEpisode(url) {
      return Number(j.$('span.text-lg').first().text().split('-')[0]);
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let inter;

    utils.fullUrlChangeDetect(function () {
      page.reset();
      check();
    });

    function check() {
      clearInterval(inter);
      inter = utils.waitUntilTrue(
        () => Puray.sync.getIdentifier(page.url),
        () => page.handlePage(),
      );
    }
  },
};
