import { pageInterface } from './../pageInterface';

export const AnimeXin: pageInterface = {
  name: 'AnimeXin',
  domain: 'https://animexin.xyz',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[3] !== 'anime') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('div.item.meta > div > span.epx > a').text();
    },
    getIdentifier: function(url) {
      return AnimeXin.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl: function(url) {
      return j.$('div.item.meta > div > span.epx > a').attr('href') || '';
    },
    getEpisode: function(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-episode-\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl: function(url) {
      const href = j
        .$('div.item.video-nav > div.naveps > div:nth-child(3) > a')
        .first()
        .attr('href');
      if (href) {
        if (AnimeXin.sync.getEpisode(url) < AnimeXin.sync.getEpisode(href)) {
          return href;
        }
      }
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('div.infox > h1.entry-title').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      selector.insertBefore(j.$('div.infox > h1.entry-title').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('div.bixbox.bxcl.epcheck > ul > li');
      },
      elementUrl: function(selector) {
        return (
          selector
            .find('div.epl-title > a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp: function(selector) {
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
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'anime' &&
          page.url.split('/')[4] !== undefined &&
          page.url.split('/')[4].length &&
          j.$('div.infox > h1.entry-title').length &&
          j.$('div.bixbox.bxcl.epcheck').length) ||
        (j.$('div.item.meta > div > span.epx > a').length &&
          j.$('div.video-content').length)
      ) {
        page.handlePage();
      }
    });
  },
};
