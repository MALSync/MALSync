import { pageInterface } from '../pageInterface';

let jsonData = {
  title: '',
  episode: null,
  aniId: null,
  nextEpUrl: null,
};

export const Kaguya: pageInterface = {
  name: 'Kaguya',
  domain: 'https://kaguya.live',
  languages: ['Vietnamese', 'English'],
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
      const id = Kaguya.sync!.getIdentifier(url);

      return `${Kaguya.domain}/anime/details/${id}`;
    },
    nextEpUrl() {
      return utils.absoluteLink(jsonData.nextEpUrl, Kaguya.domain);
    },
    getEpisode() {
      return jsonData.episode || 0;
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
    getMalUrl(provider) {
      if (provider === 'ANILIST' && jsonData.aniId)
        return `https://anilist.co/anime/${jsonData.aniId}`;

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
