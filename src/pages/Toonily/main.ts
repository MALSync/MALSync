import { pageInterface } from '../pageInterface';

export const Toonily: pageInterface = {
  name: 'Toonily',
  domain: 'https://toonily.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[5] !== undefined && url.split('/')[5].length >= 9;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.wp-manga-nav .breadcrumb li:nth-child(2) a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('.wp-manga-nav .breadcrumb li:nth-child(2) a').attr('href') || '';
    },
    getEpisode(url) {
      return parseInt(url.split('/')[5].split('-')[1]);
    },
    nextEpUrl(url) {
      return j.$('.nav-links .nav-next a:not([class^="back"])')!.attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.post-title h1')
        .contents()
        .filter(function() {
          return this.nodeType === 3;
        })
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('.tab-summary')
        .first()
        .after(
          j.html(
            `<div id="MALSyncheading" class="post-content_item"> <h6 class="text-highlight">MAL-Sync</h6></div><div id="malthing" class="post-content_item">${selector}</div>`,
          ),
        );
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'manga' &&
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0
      ) {
        page.handlePage();
      }
    });
  },
};
