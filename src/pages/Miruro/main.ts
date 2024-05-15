import { pageInterface } from '../pageInterface';

export const Miruro: pageInterface = {
  name: 'Miruro',
  domain: ['https://www.miruro.tv', 'https://www.miruro.online'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(j.$('.player[data-media-player]').length);
  },
  isOverviewPage(url) {
    return false;
  },
  getImage() {
    return $('.player[data-media-player] .vds-poster').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('.anime-title').text();
    },
    getIdentifier(url) {
      // '139630-1' for https://www.miruro.tv/watch/139630/boku-no-hero-academia-6th-season/1
      return `${utils.urlPart(url, 4)}`;
    },
    getOverviewUrl(url) {
      const href = `https://${window.location.hostname}/watch/${utils.urlPart(url, 4)}`;
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, Miruro.domain);
      }
      return '';
    },
    getEpisode(url) {
      const temp = utils.urlPart(url, 6);
      if (!temp) return NaN;
      return Number(temp);
    },
    nextEpUrl(url) {
      const totalEpisodeNumber = `${j.$("select option[value*='-']").last().val()}`.split('-');
      const nextEpisodeNumber = Miruro.sync.getEpisode(url) + 1;
      let href;
      if (totalEpisodeNumber.length > 1 && nextEpisodeNumber <= Number(totalEpisodeNumber[1]) + 1) {
        href = `https://${window.location.hostname}/watch/${utils.urlPart(url, 4)}/${utils.urlPart(url, 5)}/${nextEpisodeNumber}`;
      }
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, Miruro.domain);
      }
      return '';
    },
    getMalUrl(provider) {
      const myanimelistBtn = j.$("a[href^='https://myanimelist.net']");
      const anilistBtn = j.$("a[href^='https://anilist.co']");
      if (provider === 'ANILIST' && anilistBtn.length > 0) {
        return `${anilistBtn.attr('href')}`;
      }
      if (provider === 'MAL' && myanimelistBtn.length > 0) {
        return `${myanimelistBtn.attr('href')}`;
      }
      return false;
    },
  },
  init(page) {
    let interval;
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    ready();
    utils.urlChangeDetect(function () {
      ready();
    });
    function ready() {
      page.reset();
      if (utils.urlPart(page.url, 3) === 'watch' && utils.urlPart(page.url, 5).trim() !== '') {
        clearInterval(interval);
        interval = utils.waitUntilTrue(
          function () {
            if (j.$('.player[data-media-player] .vds-poster').length) {
              return true;
            }
            return false;
          },
          function () {
            page.handlePage();
            // globalThis.page = page; uncomment for testing from console
          },
        );
      }
    }
  },
};
