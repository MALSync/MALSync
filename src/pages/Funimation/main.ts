import { pageInterface } from './../pageInterface';

export const Funimation: pageInterface = {
  name: 'Funimation',
  domain: 'https://www.funimation.com',
  type: 'anime',
  isSyncPage: function(url) {
    if (
      j.$('h1.show-headline.video-title')[0] &&
      j.$('h2.episode-headline')[0]
    ) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('h1.show-headline.video-title a').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return (
        Funimation.domain +
        (j.$('h1.show-headline.video-title a').attr('href') || '')
      );
    },
    getEpisode: function(url) {
      return utils
        .getBaseText($('h1.show-headline.video-title'))
        .replace(/\D+/g, '');
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('h1.heroTitle').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      j.$(
        `<div class="container"> <p id="malp">${selector.html()}</p></div>`,
      ).insertBefore(j.$('div.gradient-bg').first());
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
        page.url.split('/')[3] === 'shows' &&
        (j.$('h1.show-headline.video-title')[0] || j.$('h1.heroTitle')[0])
      ) {
        page.handlePage();
      }
    });
  },
};
