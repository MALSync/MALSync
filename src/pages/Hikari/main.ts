import { pageInterface } from '../pageInterface';

type OverviewJson = {
  page: 'anime';
  name: string;
  id: string;
  mal: string;
  series_url: string;
  selector_position: string;
};

type VideoJson = {
  page: 'episode';
  episode: number;
  name: string;
  id: string;
  mal: string;
  series_url: string;
  next_episode_url: string;
};

let jsonData: OverviewJson | VideoJson | undefined;

export const Hikari: pageInterface = {
  name: 'Hikari',
  domain: ['https://watch.hikaritv.xyz'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(jsonData && jsonData.page === 'episode');
  },
  isOverviewPage(url) {
    return Boolean(jsonData && jsonData.page === 'anime');
  },
  sync: {
    getTitle(url) {
      return jsonData?.name || '';
    },
    getIdentifier(url) {
      if (!jsonData || !jsonData.id) throw new Error('No identifier found');
      return String(jsonData.id);
    },
    getOverviewUrl(url) {
      return jsonData?.series_url || '';
    },
    getEpisode(url) {
      return Number((jsonData as VideoJson)?.episode) || 0;
    },
    nextEpUrl(url) {
      return (jsonData as VideoJson)?.next_episode_url || '';
    },
    getMalUrl(provider) {
      if (jsonData?.mal && Number(jsonData?.mal))
        return `https://myanimelist.net/anime/${jsonData.mal}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return Hikari.sync.getTitle(url);
    },
    getIdentifier(url) {
      return Hikari.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      if ((jsonData as OverviewJson)?.selector_position) {
        j.$((jsonData as OverviewJson)?.selector_position).prepend(j.html(selector));
      }
    },
    getMalUrl(provider) {
      return Hikari.sync.getMalUrl!(provider);
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
