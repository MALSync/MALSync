import { pageInterface } from './../pageInterface';

export const myAnime: pageInterface = {
  name: 'myAnime',
  domain: 'https://myanime.moe',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('#episode-details > div > span.current-series > a').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return (
        myAnime.domain +
        (j.$('#episode-details > div > span.current-series > a').attr('href') ||
          '')
      );
    },
    getEpisode: function(url) {
      return parseInt(utils.urlPart(url, 5) || '');
    },
    nextEpUrl: function(url) {
      const nextEp = j
        .$('div#ep-next')
        .first()
        .parent()
        .attr('href');
      if (!nextEp) return nextEp;
      return myAnime.domain + nextEp;
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('span.anime-title')
        .first()
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('img.anime-bg').first());
    },
    getMalUrl: function(provider) {
      let url = j
        .$('a[href^="https://myanimelist.net/anime/"]')
        .not('#malRating')
        .first()
        .attr('href');
      if (url) return url;
      if (provider === 'ANILIST') {
        url = j
          .$('a[href^="https://anilist.co/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      if (provider === 'KITSU') {
        url = j
          .$('a[href^="https://kitsu.io/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('ul.list > li.li-block');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          myAnime.domain,
        );
      },
      elementEp: function(selector) {
        const url = selector
          .find('a')
          .first()
          .attr('href');

        if (!url) return NaN;

        return Number(url.split('/')[3].replace(/\D+/, ''));
      },
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
