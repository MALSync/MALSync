import { pageInterface } from '../pageInterface';

type ZoroSyncData = {
  page: 'episode' | 'anime';
  name: string;
  anime_id: string;
  mal_id: string;
  anilist_id: string;
  series_url: string;
  selector_position?: string;
  episode?: string;
  next_episode_url?: string;
};

let jsonData: ZoroSyncData;

export const Zoro: pageInterface = {
  name: 'HiAnime',
  domain: 'https://hianime.to',
  languages: ['English'],
  type: 'anime',
  database: 'Zoro',
  isSyncPage(url) {
    return jsonData.page === 'episode';
  },
  isOverviewPage(url) {
    return jsonData.page === 'anime';
  },
  sync: {
    getTitle(url) {
      return utils.htmlDecode(jsonData.name);
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    getOverviewUrl(url) {
      return jsonData.series_url.replace('watch/', '');
    },
    getEpisode(url) {
      return parseInt(jsonData.episode!);
    },
    nextEpUrl(url) {
      return jsonData.next_episode_url;
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      if (provider === 'ANILIST' && jsonData.anilist_id)
        return `https://anilist.co/anime/${jsonData.anilist_id}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return utils.htmlDecode(jsonData.name);
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position!).append(j.html(selector));
    },
    getMalUrl(provider) {
      return Zoro.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.ss-list > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Zoro.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-number'));
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
  },
};
