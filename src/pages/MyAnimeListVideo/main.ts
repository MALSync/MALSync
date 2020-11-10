import { pageInterface } from '../pageInterface';

export const MyAnimeListVideo: pageInterface = {
  name: 'MyAnimeList',
  domain: 'https://myanimelist.net',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText(j.$('div.h1-title > div > h1')).trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return url.replace(/\/\d+$/, '');
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 7));
    },
    getMalUrl(provider) {
      return `https://myanimelist.net/anime/${window.location.href.split('/')[4]}`;
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[7] !== undefined &&
        page.url.split('/')[7].length > 0 &&
        j.$('div.video-embed.clearfix').length
      ) {
        page.handlePage();
      }
    });
  },
};
