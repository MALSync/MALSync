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
      const temp = utils.urlPart(url, 5);
      if (!temp) return NaN;
      return Number(temp);
    },
    nextEpUrl(url) {
      const totalEpisodeNumber = `${j.$("select option[value*='-']").last().val()}`.split('-');
      const nextEpisodeNumber = Miruro.sync.getEpisode(url) + 1;
      let href;
      if (totalEpisodeNumber.length > 1 && nextEpisodeNumber <= Number(totalEpisodeNumber[1]) + 1) {
        href = `https://${window.location.hostname}/watch/${utils.urlPart(url, 4)}/${nextEpisodeNumber}`;
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
    let inte: NodeJS.Timer;
    utils.urlChangeDetect(() => ready());
    j.$(document).ready(() => ready());
    function ready() {
      page.reset();
      clearInterval(inte);
      inte = utils.waitUntilTrue(
        () => Miruro.sync.getTitle(window.location.href),
        () => page.handlePage(),
      );
    }
  },
};
