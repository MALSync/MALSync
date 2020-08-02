import { pageInterface } from '../pageInterface';

export const Funimation: pageInterface = {
  name: 'Funimation',
  domain: 'https://www.funimation.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('h1.show-headline.video-title')[0] && j.$('h2.episode-headline')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h1.show-headline.video-title a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return Funimation.domain + (j.$('h1.show-headline.video-title a').attr('href') || '');
    },
    getEpisode(url) {
      return utils.getBaseText($('h1.show-headline.video-title')).replace(/\D+/g, '');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.heroTitle').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('div.gradient-bg')
        .first()
        .before(j.html(`<div class="container"> ${selector}</div>`));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'shows' && (j.$('h1.show-headline.video-title')[0] || j.$('h1.heroTitle')[0])) {
        page.handlePage();
      }
    });
  },
};
