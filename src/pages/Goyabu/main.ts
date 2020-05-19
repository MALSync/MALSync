import { pageInterface } from './../pageInterface';

export const Goyabu: pageInterface = {
  name: 'Goyabu',
  domain: 'https://goyabu.com',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'videos') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('div.user-box-txt > a > h3').text();
    },
    getIdentifier: function(url) {
      const anchorHref = j.$('div.user-box-txt > a').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return j.$('div.user-box-txt > a').attr('href') || '';
    },
    getEpisode: function(url) {
      const episodePart = j.$('div.row.vibe-interactions > h1').text();
      if (episodePart.length === 0) return NaN;

      const matches = episodePart.match(/Episódio\s*\d+/gim);

      if (!matches || matches.length === 0) return NaN;

      return Number(matches[0].replace(/\D+/g, ''));
    },
    nextEpUrl: function(url) {
      return j
        .$('ul > li > div.inner > div.data > span.title > a')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('div.left20.right20 > h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector) {
      selector.insertBefore(j.$('div.phpvibe-video-list').first());
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
        page.url.split('/')[3] === 'assistir' ||
        page.url.split('/')[3] === 'videos'
      ) {
        page.handlePage();
      }
    });
  },
};
