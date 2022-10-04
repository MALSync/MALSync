import { pageInterface } from '../pageInterface';

let jsonData;

export const ADKami: pageInterface = {
  name: 'ADKami',
  domain: 'https://www.adkami.com/',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'anime' && utils.urlPart(url, 4).length !== 0;
  },
  sync: {
    getTitle(url) {
      if (jsonData.season === 1) {
        return jsonData.name;
      }

      return `${jsonData.name} Season ${jsonData.season}`;
    },
    getIdentifier(url) {
      return jsonData.id;
    },
    getOverviewUrl(url) {
      return `https://www.adkami.com/anime/${jsonData.id.split('-')[0]}/1/${url
        .split('/')
        .slice(6)
        .join('/')}`;
    },
    getEpisode(url) {
      return jsonData.episode;
    },
    nextEpUrl(url) {
      if (jsonData.nextEpisode) {
        return $('#after-video').parent('a').attr('href');
      }
      return '';
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      if (provider === 'ANILIST') {
        if (jsonData.anilist_id) return `https://anilist.co/anime/${jsonData.anilist_id}`;
      }
      return false;
    },
    uiSelector(selector) {
      j.$('#look-video').first().before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(function () {
      if (ADKami.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          function () {
            return j.$('#syncData').length;
          },
          function () {
            jsonData = JSON.parse(j.$('#syncData').text());
            if (jsonData.id.split('-')[2] === '1') {
              page.handlePage();
            } else {
              con.info('Only episodes are supported');
            }
          },
        );
      } else {
        page.handlePage();
      }
    });
  },
};
