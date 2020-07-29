import { pageInterface } from '../pageInterface';

export const Animefreak: pageInterface = {
  name: 'Animefreak',
  domain: 'https://www.animefreak.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[5] === 'episode') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.top-breadcrumb li:nth-child(2) a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return `${Animefreak.domain}/watch/${Animefreak.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number(url.split('/')[6].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j
        .$('.fa-step-forward')
        .first()
        .parent()
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, Animefreak.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.top-breadcrumb li:nth-child(2) a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('div.anime-title')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'watch') {
        page.handlePage();
      }
    });
  },
};
