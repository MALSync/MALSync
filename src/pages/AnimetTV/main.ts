import { aniListToMal } from '../../_provider/AniList/helper';
import { pageInterface } from '../pageInterface';

let jsonData = {
  title: '',
  episode: null,
  aniId: null,
  nextEpUrl: null,
};

export const AnimetTV: pageInterface = {
  name: 'AnimetTV',
  domain: 'https://animet.site',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return url.includes('/anime/watch/');
  },
  isOverviewPage(url) {
    return url.includes('/anime/details/');
  },
  sync: {
    getTitle() {
      return jsonData.title;
    },
    getIdentifier(url) {
      return jsonData.aniId!;
    },
    getOverviewUrl(url) {
      const id = AnimetTV.sync!.getIdentifier(url);

      return `${AnimetTV.domain}/anime/details/${id}`;
    },
    nextEpUrl() {
      return utils.absoluteLink(jsonData.nextEpUrl, AnimetTV.domain);
    },
    getEpisode() {
      return jsonData.episode || 0;
    },
    getMalUrl(provider) {
      return AnimetTV.overview!.getMalUrl!(provider);
    },
  },
  overview: {
    getTitle() {
      return jsonData.title;
    },
    getIdentifier() {
      return jsonData.aniId!;
    },
    uiSelector(selector) {
      j.$('#mal-sync').first().after(j.html(selector));
    },
    async getMalUrl(provider) {
      if (provider === 'ANILIST' && jsonData.aniId)
        return `https://anilist.co/anime/${jsonData.aniId}`;

      if (jsonData.aniId) {
        try {
          const malId = await aniListToMal(jsonData.aniId, 'anime');
          if (malId) return `https://myanimelist.net/anime/${malId}`;
        } catch (e) {
          // do nothing
        }
      }

      return false;
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
