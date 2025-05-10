import { pageInterface } from '../pageInterface';

let jsonData;

export const AniDream: pageInterface = {
  name: 'AniDream',
  domain: 'https://anidream.cc',
  languages: ['Italian'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page && (jsonData.page === 'episode' || jsonData.page === 'movie');
  },
  isOverviewPage(url) {
    return jsonData.page && jsonData.page === 'anime';
  },
  sync: {
    getTitle(url) {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    getOverviewUrl(url) {
      return jsonData.series_url;
    },
    getEpisode(url) {
      return Number(jsonData.episode) || 1;
    },
    nextEpUrl(url) {
      if (jsonData.next_episode_url) {
        return jsonData.next_episode_url;
      }
      return '';
    },
    uiSelector(selector) {
      if (jsonData.page === 'movie') {
        AniDream.overview!.uiSelector!(selector);
      }
    },
    getMalUrl(provider) {
      if (jsonData.myanimelist_id)
        return `https://myanimelist.net/anime/${jsonData.myanimelist_id}`;
      if (jsonData.anilist_id && provider === 'ANILIST')
        return `https://anilist.co/anime/${jsonData.anilist_id}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return AniDream.sync.getTitle(url);
    },
    getIdentifier(url) {
      return AniDream.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position).first().append(j.html(selector));
    },
    getMalUrl(provider) {
      return AniDream.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.ad-episodes > li > a.ad-episode');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AniDream.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-episode'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let _debounce;

    utils.changeDetect(check, () => j.$('#syncData').text());
    check();

    function check() {
      page.reset();
      if (j.$('#syncData').length) {
        jsonData = JSON.parse(j.$('#syncData').text());
        clearTimeout(_debounce);
        _debounce = setTimeout(() => {
          page.handlePage();
        }, 500);
      }
    }

    utils.changeDetect(
      () => {
        page.handleList();
      },
      () => j.$('.ms-episodes').text(),
    );
  },
};
