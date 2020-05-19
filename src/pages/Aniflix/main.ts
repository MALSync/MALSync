import { pageInterface } from './../pageInterface';

export const Aniflix: pageInterface = {
  name: 'Aniflix',
  domain: 'https://www1.aniflix.tv',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[6] === 'season') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      const urlParts = url.split('/');

      if (urlParts[7] === '1' || urlParts[7] === '0') {
        return j.$('a.episode-showname').text();
      }

      return `${j.$('a.episode-showname').text()} season ${url.split('/')[7]}`;
    },
    getIdentifier: function(url) {
      return `${url.split('/')[4]}?s=${url.split('/')[7]}`;
    },
    getOverviewUrl: function(url) {
      return Aniflix.domain + (j.$('a.episode-showname').attr('href') || '');
    },
    getEpisode: function(url) {
      return Number(url.split('/')[9]);
    },
  },
  overview: {
    getTitle: function(url) {
      if (
        Number(
          j
            .$('div.seasons-wrapper > div.season.season-active > div')
            .first()
            .text()
            .replace(/\D+/g, ''),
        ) == 1 ||
        j
          .$('div.seasons-wrapper > div.season.season-active > div')
          .first()
          .text() === 'Specials'
      ) {
        return j.$('h1.show-name').text();
      } else {
        return `${j.$('h1.show-name').text()} season ${j
          .$('div.seasons-wrapper > div.season.season-active > div')
          .first()
          .text()
          .replace(/\D+/g, '')}`;
      }
    },
    getIdentifier: function(url) {
      if (
        j
          .$('div.seasons-wrapper > div.season.season-active > div')
          .first()
          .text() === 'Specials'
      ) {
        return `${url.split('/')[4]}?s=0`;
      } else {
        return `${url.split('/')[4]}?s=${j
          .$('div.seasons-wrapper > div.season.season-active > div')
          .first()
          .text()
          .replace(/\D+/g, '')}`;
      }
    },
    uiSelector: function(selector) {
      selector.insertBefore(j.$('div.episodes').first());
    },
  },
  init(page) {
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    page.url = window.location.href;
    ready();
    utils.urlChangeDetect(function() {
      ready();
    });
    function ready() {
      page.url = window.location.href;
      page.UILoaded = false;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
      if (page.url.split('/')[3] === 'show') {
        if (Aniflix.isSyncPage(page.url)) {
          utils.waitUntilTrue(
            function() {
              if (j.$('a.episode-showname').length) {
                return true;
              } else {
                return false;
              }
            },
            function() {
              page.handlePage();
            },
          );
        } else {
          j.$('#malp').remove();
          page.UILoaded = false;
          utils.waitUntilTrue(
            function() {
              if (
                j.$('h1.show-name').length &&
                j
                  .$('h1.show-name')
                  .first()
                  .text()
              ) {
                return true;
              } else {
                return false;
              }
            },
            function() {
              page.handlePage();
              $('div.seasons-wrapper')
                .unbind('click')
                .click(function() {
                  j.$('#malp').remove();
                  page.UILoaded = false;
                  page.handlePage();
                });
            },
          );
        }
      }
    }
  },
};
