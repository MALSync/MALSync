import { pageInterface } from '../pageInterface';

let jsonData: null | {
  name: string;
  mal_id: number;
  ani_id: number;
  episode: number;
  series_url: string;
  next_ep: {
    title: string;
    permalink: string;
  };
};

export const Pactedanime: pageInterface = {
  name: 'Pactedanime',
  domain: 'https://pactedanime.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(jsonData && jsonData.name && typeof jsonData.episode !== 'undefined');
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.htmlDecode(jsonData!.name);
    },
    getIdentifier(url) {
      return Pactedanime.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return jsonData!.series_url;
    },
    getEpisode(url) {
      return Number(jsonData!.episode);
    },
    nextEpUrl(url) {
      if (!jsonData!.next_ep || !jsonData!.next_ep.permalink) return '';
      return jsonData!.next_ep.permalink;
    },
    getMalUrl(provider) {
      if (jsonData!.mal_id) return `https://myanimelist.net/anime/${jsonData!.mal_id}`;
      if (jsonData!.ani_id) return `https://anilist.co/anime/${jsonData!.ani_id}`;
      return false;
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      utils.waitUntilTrue(
        () => j.$('#malSync').length,
        () => {
          jsonData = JSON.parse(j.$('#malSync').text());

          page.handlePage();
        },
      );
    });
  },
};
