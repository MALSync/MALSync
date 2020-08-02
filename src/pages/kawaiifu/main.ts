import { pageInterface } from '../pageInterface';

export const kawaiifu: pageInterface = {
  name: 'kawaiifu',
  domain: ['https://kawaiifu.com', 'https://bestwea.stream', 'https://animestuffs.com'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (
      url.split('/')[3] === 'season' ||
      url.split('/')[3] === 'dub' ||
      url.split('/')[3] === 'tv-series' ||
      url.split('/')[3] === 'anime-movies'
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h2.title')
        .text()
        .replace(/(\( ?)?uncensored( ?\))?/gim, ' ')
        .replace(/(\( ?)?dub( ?\))?/gim, ' ')
        .trim();
    },
    getIdentifier(url) {
      if (url.split('/')[3] === 'dub' || url.split('/')[3] === 'tv-series' || url.split('/')[3] === 'anime-movies') {
        return url.split('/')[4].replace(/\.[^.]*$/g, '');
      }
      return url.split('/')[5].replace(/\.[^.]*$/g, '');
    },
    getOverviewUrl(url) {
      if (url.split('/')[3] === 'dub' || url.split('/')[3] === 'tv-series' || url.split('/')[3] === 'anime-movies') {
        return `https://kawaiifu.com/${url.split('/')[3]}/${url.split('/')[4].replace(/\?[^?]*$/g, '')}`;
      }
      return `https://kawaiifu.com/${url.split('/')[3]}/${url.split('/')[4]}/${url
        .split('/')[5]
        .replace(/\?[^?]*$/g, '')}`;
    },
    getEpisode(url) {
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
      }
      return Number(
        j
          .$('ul.list-ep a.active')
          .text()
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl(url) {
      const href = j
        .$('div#server_ep a.active')
        .closest('li')
        .next()
        .find('a')
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, kawaiifu.domain);
      }
      return '';
    },
    uiSelector(selector) {
      j.$('div.desc-top')
        .first()
        .after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // no UI
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j
          .$('div#server_ep a.active')
          .closest('ul.list-ep')
          .children();
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
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
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
