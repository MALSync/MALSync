import { pageInterface } from '../pageInterface';

export const BetterAnime: pageInterface = {
  name: 'BetterAnime',
  domain: 'https://betteranime.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return url.split('/')[6].startsWith('episodio-');
  },
  isOverviewPage(url) {
    return url.split('/')[6] === 'undefined';
  },
  sync: {
    getTitle(url) {
      return j
        .$('.anime-title > h2')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[5];
    },
    getOverviewUrl(url) {
      return url.substring(0, url.lastIndexOf('/'));
    },
    getEpisode(url) {
      return Number(
        j
          .$('.anime-title > h3')
          .text()
          .replace(/\D+/g, ''),
      );
    },
  },
  init(page) {
    j.$(document).ready(function() {
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      page.handlePage();
    });
  },
};
