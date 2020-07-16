// Owner does not want to be supported by mal-sync

import { pageInterface } from '../pageInterface';

export const WonderfulSubs: pageInterface = {
  name: 'WonderfulSubs',
  domain: 'https://wonderfulsubs.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('span.card-title p.hide-truncate.activator').text();
    },
    getIdentifier(url) {
      return j
        .$('span.card-title p.hide-truncate.activator')
        .text()
        .toLowerCase()
        .replace(/ /g, '-');
    },
    getOverviewUrl(url) {
      return `${WonderfulSubs.domain}/watch/${url.split('/')[4].replace(/\?[^?]*$/g, '')}`;
    },
    getEpisode(url) {
      return Number(
        j
          .$('span.card-title span.new.badge')
          .text()
          .replace(/\D+/g, ''),
      );
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    page.url = window.location.href;
    if (page.url.split('/')[2] === 'beta.wonderfulsubs.com') {
      WonderfulSubs.isSyncPage = betaWonderfulSubs.isSyncPage;
      WonderfulSubs.sync = betaWonderfulSubs.sync;
      betaWonderfulSubs.init(page);
    } else {
      if (page.url.split('/')[3] === 'watch') {
        utils.waitUntilTrue(
          function() {
            return j.$('span.card-title p.hide-truncate.activator').text();
          },
          function() {
            page.handlePage();
          },
        );
      }
      utils.urlChangeDetect(function() {
        page.reset();
        if (page.url.split('/')[3] === 'watch') {
          utils.waitUntilTrue(
            function() {
              return j.$('span.card-title p.hide-truncate.activator').text();
            },
            function() {
              page.handlePage();
            },
          );
        }
      });
    }
  },
};

let betaWonderfulSubs: pageInterface = {
  name: 'betaWonderfulSubs',
  domain: 'https://beta.wonderfulsubs.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h6.subtitle').text();
    },
    getIdentifier(url) {
      return j
        .$('h6.subtitle')
        .text()
        .toLowerCase()
        .replace(/ /g, '-');
    },
    getOverviewUrl(url) {
      return `${'https://beta.wonderfulsubs.com/watch/'}${url.split('/')[4].replace(/\?[^?]*$/g, '')}`;
    },
    getEpisode(url) {
      return Number(
        j
          .$('div.episode-number')
          .text()
          .replace(/\D+/g, ''),
      );
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    page.url = window.location.href;
    if (page.url.split('/')[3] === 'watch') {
      utils.waitUntilTrue(
        function() {
          return j.$('h6.subtitle').text();
        },
        function() {
          page.handlePage();
        },
      );
    }
    utils.urlChangeDetect(function() {
      page.reset();
      if (page.url.split('/')[3] === 'watch') {
        utils.waitUntilTrue(
          function() {
            return j.$('h6.subtitle').text();
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
