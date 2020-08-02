import { pageInterface } from '../pageInterface';

let jsonData;

export const JustAnime: pageInterface = {
  name: 'JustAnime',
  domain: 'https://justanime.app',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page && jsonData.page === 'episode';
  },
  isOverviewPage(url) {
    return jsonData.page && jsonData.page === 'anime';
  },
  sync: {
    getTitle(url) {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.mal_id;
    },
    getOverviewUrl(url) {
      return jsonData.series_url;
    },
    getEpisode(url) {
      return jsonData.episode;
    },
    nextEpUrl(url) {
      if (jsonData.next_episode_url) {
        return jsonData.next_episode_url;
      }
      return '';
    },
    getMalUrl(provider) {
      return `https://myanimelist.net/anime/${JustAnime.sync.getIdentifier(window.location.href)}`;
    },
  },
  overview: {
    getTitle(url) {
      return JustAnime.sync.getTitle(url);
    },
    getIdentifier(url) {
      return JustAnime.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position)
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      return JustAnime.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episodeswrapper > #episodes > button');
      },
      elementUrl(selector) {
        return selector.attr('episodeurl') || '';
      },
      elementEp(selector) {
        const text = utils.getBaseText($(selector).find('span'));
        if (text.toLowerCase().includes('next')) return NaN;
        if (text.toLowerCase().includes('movie')) return 1;
        return Number(text.replace(/\D+/g, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;
    let oldJson;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          if (j.$('#syncData').length) {
            jsonData = JSON.parse(j.$('#syncData').text());
            if (JSON.stringify(jsonData) !== oldJson) {
              oldJson = JSON.stringify(jsonData);
              return true;
            }
          }
          return false;
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};
