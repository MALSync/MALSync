import { pageInterface } from '../pageInterface';

export const AniMixPlay: pageInterface = {
  name: 'AniMixPlay',
  domain: 'https://animixplay.com',
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('span.animetitle').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return url.replace(/ep\d+$/i, '').replace(/\/$/, '');
    },
    getEpisode(url) {
      return Number(
        j
          .$('#epslistplace > button:disabled')
          .last()
          .text()
          .replace(/\D+/g, ''),
      );
    },
    uiSelector(selector) {
      selector.insertAfter(j.$('span.animetitle').first());
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          return AniMixPlay.sync.getEpisode(page.url);
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};
