import { pageInterface } from './../pageInterface';

export const kawaiifu: pageInterface = {
  name: 'kawaiifu',
  domain: [
    'https://kawaiifu.com',
    'https://bestwea.stream',
    'https://animestuffs.com',
  ],
  type: 'anime',
  isSyncPage: function(url) {
    if (
      url.split('/')[3] === 'season' ||
      url.split('/')[3] === 'dub' ||
      url.split('/')[3] === 'tv-series' ||
      url.split('/')[3] === 'anime-movies'
    ) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('h2.title')
        .text()
        .replace(/(\( ?)?uncensored( ?\))?/gim, ' ')
        .replace(/(\( ?)?dub( ?\))?/gim, ' ')
        .trim();
    },
    getIdentifier: function(url) {
      if (
        url.split('/')[3] === 'dub' ||
        url.split('/')[3] === 'tv-series' ||
        url.split('/')[3] === 'anime-movies'
      ) {
        return url.split('/')[4].replace(/\.[^.]*$/g, '');
      } else {
        return url.split('/')[5].replace(/\.[^.]*$/g, '');
      }
    },
    getOverviewUrl: function(url) {
      if (
        url.split('/')[3] === 'dub' ||
        url.split('/')[3] === 'tv-series' ||
        url.split('/')[3] === 'anime-movies'
      ) {
        return `https://kawaiifu.com/${url.split('/')[3]}/${url
          .split('/')[4]
          .replace(/\?[^?]*$/g, '')}`;
      } else {
        return `https://kawaiifu.com/${url.split('/')[3]}/${
          url.split('/')[4]
        }/${url.split('/')[5].replace(/\?[^?]*$/g, '')}`;
      }
    },
    getEpisode: function(url) {
      if (
        j
          .$('ul.list-ep a.active')
          .text()
          .toLowerCase()
          .indexOf('trailer') !== -1 ||
        j
          .$('ul.list-ep a.active')
          .text()
          .toLowerCase()
          .indexOf('teaser') !== -1
      ) {
        return 0;
      } else {
        return Number(
          j
            .$('ul.list-ep a.active')
            .text()
            .replace(/\D+/g, ''),
        );
      }
    },
    nextEpUrl: function(url) {
      const href = j
        .$('div#server_ep a.active')
        .closest('li')
        .next()
        .find('a')
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, kawaiifu.domain);
      }
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('div.desc-top').first());
    },
  },
  overview: {
    getTitle: function(url) {
      return '';
    },
    getIdentifier: function(url) {
      return '';
    },
    uiSelector: function(selector) {
      return;
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j
          .$('div#server_ep a.active')
          .closest('ul.list-ep')
          .children();
      },
      elementUrl: function(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp: function(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .text()
            .replace(/\D+/g, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
