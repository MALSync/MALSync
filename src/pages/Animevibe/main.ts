import { pageInterface } from '../pageInterface';

export const Animevibe: pageInterface = {
  name: 'Animevibe',
  domain: 'https://animevibe.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'a') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('span.td-bred-no-url-last').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return `${Animevibe.domain}/a/${Animevibe.sync.getIdentifier(url)}/1`;
    },
    getEpisode(url) {
      if (!utils.urlPart(url, 5)) {
        return 1;
      }
      return parseInt(utils.urlPart(url, 5));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
