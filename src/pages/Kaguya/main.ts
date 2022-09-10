import { pageInterface } from '../pageInterface';

let jsonData = {
  title: '',
  episode: null,
  aniId: null,
  id: null,
  nextEpUrl: null,
};

const domain = 'https://kaguya.live';

export const Kaguya: pageInterface = {
  name: 'Kaguya',
  domain,
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
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      const id = utils.urlPart(url, 5);

      return `${domain}/anime/details/${id}`;
    },
    nextEpUrl() {
      return `${domain}${jsonData.nextEpUrl}`;
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
      return (jsonData.aniId || 0).toString();
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

    j.$(document).ready(function () {
      const check = () => {
        utils.waitUntilTrue(
          function () {
            const tempJsonData = JSON.parse(j.$('#syncData').text() || '{}');

            return Object.keys(tempJsonData).length !== 0;
          },
          function () {
            jsonData = JSON.parse(j.$('#syncData').text() || '{}');

            page.handlePage();
          },
        );
      };

      utils.fullUrlChangeDetect(function () {
        page.reset();
        check();
      });
    });
  },
};
