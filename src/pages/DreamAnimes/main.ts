import { pageInterface } from './../pageInterface';

export const DreamAnimes: pageInterface = {
  name: 'Dream Animes',
  domain: 'https://dreamanimes.com.br',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'online') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$('#anime_name').text();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl: function(url) {
      return `${DreamAnimes.domain}/anime-info/${DreamAnimes.sync.getIdentifier(
        url,
      )}`;
    },
    getEpisode: function(url) {
      return parseInt(utils.urlPart(url, 7));
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('.truncate').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('#pcontent h3'));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let Interval;

    j.$(document).ready(function() {
      start();

      utils.urlChangeDetect(function() {
        page.url = window.location.href;
        page.UILoaded = false;
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
        start();
      });
    });

    function start() {
      if (
        utils.urlPart(page.url, 3) === 'online' ||
        utils.urlPart(page.url, 3) === 'anime-info'
      ) {
        if (DreamAnimes.isSyncPage(page.url)) {
          page.handlePage();
        } else {
          clearInterval(Interval);
          Interval = utils.waitUntilTrue(
            function() {
              return DreamAnimes.overview!.getTitle(page.url);
            },
            function() {
              page.handlePage();
            },
          );
        }
      }
    }
  },
};
