import { pageInterface } from '../pageInterface';

export const AnimeWho: pageInterface = {
  name: 'AnimeWho',
  domain: 'https://animewho.com',
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(url) {
    return j.$('#malsync-data').attr('issyncpage') === 'true';
  },
  sync: {
    getTitle(url) {
      return j.$('#malsync-data').attr('name')!;
    },
    getIdentifier(url) {
      return `${j.$('#malsync-data').attr('type')}-${j.$('#malsync-data').attr('series_id')!}`;
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('#malsync-data').attr('overview_link')!, AnimeWho.domain);
    },
    getEpisode(url) {
      return Number(j.$('#malsync-data').attr('episode')!);
    },
    nextEpUrl(url) {
      if (j.$('#malsync-data').attr('next_episode')) {
        return utils.absoluteLink(j.$('#malsync-data').attr('next_episode'), AnimeWho.domain);
      }
      return '';
    },
    getMalUrl(provider) {
      if (j.$('#malsync-data').attr('mal_url') && j.$('#malsync-data').attr('mal_url') !== '-') {
        return j.$('#malsync-data').attr('mal_url')!;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return AnimeWho.sync.getTitle(url);
    },
    getIdentifier(url) {
      return AnimeWho.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#malsync_selector').append(j.html(selector));
    },
    getMalUrl(provider) {
      return AnimeWho.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;
    let oldHtml = '';

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      if (!j.$('#malsync-data').length) {
        oldHtml = '';
      }
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          if (j.$('#malsync-data').length && j.$('#malsync-data').prop('outerHTML')! !== oldHtml) {
            oldHtml = j.$('#malsync-data').prop('outerHTML');
            return true;
          }
          return false;
        },
        function() {
          if (j.$('#malsync-data').attr('type') === 'anime') {
            AnimeWho.type = 'anime';
          } else {
            AnimeWho.type = 'manga';
          }
          page.handlePage();
        },
      );
    }
  },
};
