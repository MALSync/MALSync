import { pageInterface } from '../pageInterface';

export const version5: pageInterface = {
  name: 'MangaPark',
  domain: 'https://mangapark.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(
      url.split('/')[3] === 'title' &&
        typeof url.split('/')[5] !== 'undefined' &&
        url.split('/')[5].length > 0,
    );
  },
  isOverviewPage(url) {
    if (
      url.split('/')[3] === 'title' &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h3 > a[href*="/title/"]').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(version5.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('h3 > a[href*="/title/"]').first().attr('href'),
        version5.domain,
      );
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5).match(/(chapter|ch)(-|.)(\d+)/i);
      if (!episodePart) return NaN;
      return Number(episodePart[3]);
    },
    getVolume(url) {
      const volumePart = utils.urlPart(url, 5).match(/(volume|vol)(-|.)(\d+)/i);
      if (!volumePart) return NaN;
      return Number(volumePart[3]);
    },
    nextEpUrl(url) {
      const href = j.$('span:contains("Next Chapter ▶")').parent('a').attr('href');

      if (href) {
        return utils.absoluteLink(href, version5.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h3 > a[href*="/title/"]').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div[data-name="chapter-list"]').first().before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./version5.less').toString(),
    );

    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
