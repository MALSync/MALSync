import { pageInterface } from '../pageInterface';

export const Aniflix: pageInterface = {
  name: 'Aniflix',
  domain: 'https://www1.aniflix.tv',
  languages: ['German'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[6] === 'season') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const urlParts = url.split('/');

      if (urlParts[7] === '1' || urlParts[7] === '0') {
        return j.$('a.episode-showname').text();
      }

      return `${j.$('a.episode-showname').text()} season ${url.split('/')[7]}`;
    },
    getIdentifier(url) {
      return `${url.split('/')[4]}?s=${url.split('/')[7]}`;
    },
    getOverviewUrl(url) {
      return Aniflix.domain + (j.$('a.episode-showname').attr('href') || '');
    },
    getEpisode(url) {
      return Number(url.split('/')[9]);
    },
  },
  overview: {
    getTitle(url) {
      if (
        Number(
          j
            .$('div.seasons-wrapper > div.season.season-active > div')
            .first()
            .text()
            .replace(/\D+/g, ''),
        ) === 1 ||
        j
          .$('div.seasons-wrapper > div.season.season-active > div')
          .first()
          .text() === 'Specials'
      ) {
        return j.$('h1.show-name').text();
      }
      return `${j.$('h1.show-name').text()} season ${j
        .$('div.seasons-wrapper > div.season.season-active > div')
        .first()
        .text()
        .replace(/\D+/g, '')}`;
    },
    getIdentifier(url) {
      if (
        j
          .$('div.seasons-wrapper > div.season.season-active > div')
          .first()
          .text() === 'Specials'
      ) {
        return `${url.split('/')[4]}?s=0`;
      }
      return `${url.split('/')[4]}?s=${j
        .$('div.seasons-wrapper > div.season.season-active > div')
        .first()
        .text()
        .replace(/\D+/g, '')}`;
    },
    uiSelector(selector) {
      j.$('div.episodes')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    page.url = window.location.href;
    ready();
    utils.urlChangeDetect(function() {
      ready();
    });
    function ready() {
      page.reset();
      if (page.url.split('/')[3] === 'show') {
        if (Aniflix.isSyncPage(page.url)) {
          utils.waitUntilTrue(
            function() {
              if (j.$('a.episode-showname').length) {
                return true;
              }
              return false;
            },
            function() {
              page.handlePage();
            },
          );
        } else {
          page.reset();
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
              }
              return false;
            },
            function() {
              page.handlePage();
              $('div.seasons-wrapper')
                .unbind('click')
                .click(function() {
                  page.reset();
                  page.handlePage();
                });
            },
          );
        }
      }
    }
  },
};
