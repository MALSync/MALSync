import { pageInterface } from '../pageInterface';

let jsonData;

export const Simplyaweeb: pageInterface = {
  name: 'Simplyaweeb',
  domain: 'https://simplyaweeb.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.id;
    },
    getOverviewUrl(url) {
      return url;
    },
    getEpisode(url) {
      return jsonData.episode;
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    utils.changeDetect(loaded, () => {
      const data = j.$('#syncData').text();
      if (!data) page.reset();
      return data;
    });

    function loaded() {
      const text = j.$('#syncData').text();
      if (text) {
        const data = JSON.parse(text);
        if (data && data.length) {
          jsonData = data[0];
          if (jsonData.type === 'anime') {
            Simplyaweeb.type = 'anime';
            Simplyaweeb.database = 'Gogoanime';
          } else {
            Simplyaweeb.type = 'manga';
            Simplyaweeb.database = 'MangaNelo';
          }
          page.handlePage();
        }
      }
    }
  },
};
