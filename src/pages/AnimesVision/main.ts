import { pageInterface } from '../pageInterface';

type VisionSyncData = {
  page: 'episodio' | 'anime';
  name: string;
  anime_id: string;
  mal_id: string;
  series_url: string;
  selector_position?: string;
  episode?: string;
  next_episode_url?: string;
};

let jsonData: VisionSyncData;

function filterTitle(title: string) {
  return title
    .replace(/Dublado/gim, '')
    .replace(/[\s-\s]*$/, '')
    .trim();
}

export const AnimesVision: pageInterface = {
  name: 'AnimesVision',
  domain: 'https://animesvision.biz',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page === 'episodio';
  },
  isOverviewPage(url) {
    return jsonData.page === 'anime';
  },
  sync: {
    getTitle(url) {
      return filterTitle(utils.htmlDecode(jsonData.name));
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    getOverviewUrl(url) {
      return jsonData.series_url;
    },
    getEpisode(url) {
      return parseInt(jsonData.episode!);
    },
    nextEpUrl(url) {
      return jsonData.next_episode_url;
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return filterTitle(utils.htmlDecode(jsonData.name));
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position!).append(j.html(selector));
    },
    getMalUrl(provider) {
      return AnimesVision.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.ss-list > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimesVision.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-number'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

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
