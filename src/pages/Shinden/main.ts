import { pageInterface } from '../pageInterface';

export const Shinden: pageInterface = {
  name: 'Shinden',
  domain: 'https://shinden.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'episode') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.page-title > a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('h1.page-title > a').attr('href') || '';
    },
    getEpisode(url) {
      const episodeText = j.$('dl.info-aside-list:nth-child(1) > dd:nth-child(2)').text();

      if (!episodeText) return NaN;

      return Number(episodeText.replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.page-title')
        .text()
        .replace(/anime:/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      selector.insertAfter(j.$('.title-other').first());
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'series' || page.url.split('/')[3] === 'episode') {
        page.handlePage();
      }
    });
  },
};
