import { pageInterface } from '../pageInterface';

export const Miruro: pageInterface = {
  name: 'Miruro',
  domain: ['https://www.miruro.tv', 'https://www.miruro.online'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'watch' && utils.urlPart(url, 5).trim() !== '';
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('.anime-title').text();
    },
    getIdentifier(url) {
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
        return `${anilistBtn.first().attr('href')}`;
      }
      if (myanimelistBtn.length > 0) {
        return `${myanimelistBtn.first().attr('href')}`;
      }
      return false;
    },
    uiSelector(selector) {
      j.$('.anime-title').parent().parent().before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.urlChangeDetect(() => {
      ready();
    });
    utils.waitUntilTrue(
      () => {
        if (j.$('.player[data-media-player]').length) {
          return true;
        }
        return false;
      },
      () => {
        ready();
        // globalThis.page = page; uncomment for testing from console
      },
    );
    function ready() {
      page.reset();
      page.handlePage();
    }
  },
};
