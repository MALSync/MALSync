import { pageInterface } from '../pageInterface';

export const Miruro: pageInterface = {
  name: 'Miruro',
  domain: ['https://www.miruro.tv', 'https://www.miruro.online'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return (
      utils.urlPart(url, 3) === 'watch' &&
      utils.urlParam(url, 'id') !== null &&
      utils.urlParam(url, 'ep') !== null
    );
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'info' && utils.urlParam(url, 'id') !== null;
  },
  sync: {
    getTitle(url) {
      return j.$('.title a').first().text();
    },
    getIdentifier(url) {
      return `${utils.urlParam(url, 'id')}`;
    },
    getOverviewUrl(url) {
      const href = `https://${window.location.hostname}/info?id=${utils.urlParam(url, 'id')}`;
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, Miruro.domain);
      }
      return '';
    },
    getEpisode(url) {
      const temp = utils.urlParam(url, 'ep');
      if (!temp) return NaN;
      return Number(temp);
    },
    nextEpUrl(url) {
      const totalEpisodeNumber = `${j.$("select option[value*='-']").last().val()}`.split('-');
      const nextEpisodeNumber = Miruro.sync.getEpisode(url) + 1;
      let href;
      if (totalEpisodeNumber.length > 1 && nextEpisodeNumber <= Number(totalEpisodeNumber[1]) + 1) {
        href = `https://${window.location.hostname}/watch?id=${utils.urlParam(url, 'id')}&ep=${nextEpisodeNumber}`;
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
  },
  overview: {
    getTitle(url) {
      if (j.$('#root h1').first().text()) {
        return utils.getBaseText(j.$('#root h1').first()).trim();
      }
      return '';
    },
    getIdentifier(url) {
      return Miruro.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#root h1').first().after(j.html(selector));
    },
    getMalUrl(provider) {
      return Miruro.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    let inte: NodeJS.Timer;
    utils.urlChangeDetect(() => ready());
    j.$(() => ready());
    function ready() {
      page.reset();
      if (!Miruro.isSyncPage(window.location.href) && !Miruro.isOverviewPage!(window.location.href))
        return;
      clearInterval(inte);
      inte = utils.waitUntilTrue(
        () =>
          Miruro.sync.getTitle(window.location.href) ||
          Miruro.overview!.getTitle(window.location.href) !== '',
        () => {
          page.handlePage();
        },
      );
    }
  },
};
