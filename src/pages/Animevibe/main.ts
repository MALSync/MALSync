import { pageInterface } from './../pageInterface';

export const Animevibe: pageInterface = {
  name: 'Animevibe',
  domain: 'https://animevibe.tv',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'a') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('span.td-bred-no-url-last').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return `${Animevibe.domain}/a/${Animevibe.sync.getIdentifier(url)}/1`;
    },
    getEpisode: function(url) {
      if (utils.urlPart(url, 5) === '') {
        return 1;
      } else {
        return parseInt(utils.urlPart(url, 5));
      }
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
      page.handlePage();
    });
  },
};
