import { pageInterface } from '../pageInterface';

export const AnimeXin: pageInterface = {
  name: 'AnimeXin',
  domain: 'https://animexin.xyz',
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== 'anime') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.item.meta > div > span.epx > a').text();
    },
    getIdentifier(url) {
      return AnimeXin.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('div.item.meta > div > span.epx > a').attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-episode-\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j
        .$('div.item.video-nav > div.naveps > div:nth-child(3) > a')
        .first()
        .attr('href');
      if (href) {
        if (AnimeXin.sync.getEpisode(url) < AnimeXin.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.infox > h1.entry-title').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      selector.insertBefore(j.$('div.infox > h1.entry-title').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.bixbox.bxcl.epcheck > ul > li');
      },
      elementUrl(selector) {
        return (
          selector
            .find('div.epl-title > a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return AnimeXin.sync.getEpisode(
          selector
            .find('div.epl-title > a')
            .first()
            .attr('href'),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'anime' &&
          page.url.split('/')[4] !== undefined &&
          page.url.split('/')[4].length &&
          j.$('div.infox > h1.entry-title').length &&
          j.$('div.bixbox.bxcl.epcheck').length) ||
        (j.$('div.item.meta > div > span.epx > a').length && j.$('div.video-content').length)
      ) {
        page.handlePage();
      }
    });
  },
};
