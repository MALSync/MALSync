import { pageInterface } from './../pageInterface';

export const manga4life: pageInterface = {
  name: 'manga4life',
  domain: 'https://manga4life.com',
  type: 'manga',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'read-online') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return utils
        .getBaseText(
          $(
            'div.MainContainer > div.container > div.row > div.Column > a',
          ).first(),
        )
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(manga4life.sync.getOverviewUrl(url), 4) || '';
    },
    getOverviewUrl: function(url) {
      return utils.absoluteLink(
        j
          .$('div.MainContainer > div.container > div.row > div.Column > a')
          .first()
          .attr('href'),
        manga4life.domain,
      );
    },
    getEpisode: function(url) {
      return utils
        .getBaseText(
          $(
            'div.MainContainer > div.container > div.row > div.Column:nth-child(2) > button',
          ).first(),
        )
        .match(/\d+/gim);
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('div.BoxBody > div.row > div.top-5 > ul > li:nth-child(1) > h1')
        .first()
        .text();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector: function(selector) {
      selector.insertAfter(
        j
          .$('div.BoxBody > div.row > div.top-5 > ul > li:nth-child(1) > h1')
          .first(),
      );
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
        page.url.split('/')[3] === 'read-online' ||
        page.url.split('/')[3] === 'manga'
      ) {
        page.handlePage();
      }
    });
  },
};
