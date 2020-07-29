import { pageInterface } from '../pageInterface';

export const DreamAnimes: pageInterface = {
  name: 'Dream Animes',
  domain: 'https://dreamanimes.com.br',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'online') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#anime_name').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      return `${DreamAnimes.domain}/anime-info/${DreamAnimes.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 7));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.truncate').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('#pcontent h3').after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let Interval;

    j.$(document).ready(function() {
      start();

      utils.urlChangeDetect(function() {
        page.reset();
        start();
      });
    });

    function start() {
      if (utils.urlPart(page.url, 3) === 'online' || utils.urlPart(page.url, 3) === 'anime-info') {
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
