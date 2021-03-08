import { pageInterface } from '../pageInterface';

export const RiiE: pageInterface = {
  name: 'RiiE',
  domain: 'https://www.riie.net',
  languages: ['Indonesian'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('#lightsVideo')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('#content > div.postarea > div > div.post > div:nth-child(1) > b')
        .text()
        .replace(/episode.*/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return RiiE.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return (
        j
          .$('#content > div.postarea > div > div.post > div.newzone > div.right > a:not([rel])')
          .first()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-episode-\d*-/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = $("a[rel='next']")
        .first()
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, RiiE.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return url.split('/')[4].replace(/-/g, ' ');
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('#content > div.naru > div.areaxb')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.episodelist > ul > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('span.leftoff > a')
            .first()
            .attr('href'),
          RiiE.domain,
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('span.leftoff > a')
            .first()
            .text()
            .replace(/\D+/, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'anime' ||
        (j.$('#lightsVideo')[0] && j.$('#content > div.postarea > div > div.post > div.newzone > div.right')[0])
      )
        page.handlePage();
    });
  },
};
