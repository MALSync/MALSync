import { pageInterface } from './../pageInterface';

export const serimanga: pageInterface = {
  name: 'serimanga',
  domain: 'https://serimanga.com',
  type: 'manga',
  isSyncPage: function(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return utils
        .getBaseText(
          $('#reader > div.read-top-menu > div.rtm-logo > a.back.text-white'),
        )
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl: function(url) {
      return (
        j
          .$('#reader > div.read-top-menu > div.rtm-logo > a.back.text-white')
          .attr('href') || ''
      );
    },
    getEpisode: function(url) {
      return Number(url.split('/')[5]);
    },
    nextEpUrl: function(url) {
      return j
        .$('#chapterButtons2 > div > div:nth-child(2) > a')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('div.seri-img > div > div > div.name')
        .first()
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('div.sub-top-text').first());
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
