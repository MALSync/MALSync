import { pageInterface } from '../pageInterface';

let jsonData;

export const Aniyan: pageInterface = {
  name: 'Aniyan',
  domain: 'https://aniyan.net',
  languages: ['Portuguese'],
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
        Aniyan.overview!.uiSelector!(selector);
      }
    },
    getMalUrl(provider) {
      if (jsonData.myanimelist_id)
        return `https://myanimelist.net/anime/${jsonData.myanimelist_id}`;
      if (jsonData.anilist_id) return `https://anilist.co/anime/${jsonData.anilist_id}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return Aniyan.sync.getTitle(url);
    },
    getIdentifier(url) {
      return Aniyan.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position).first().append(j.html(selector));
    },
    getMalUrl(provider) {
      return Aniyan.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.episodios .episodes');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('div div.season_m a').attr('href'), Aniyan.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('episode'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      utils.waitUntilTrue(
        () => j.$('#syncData').length,
        () => {
          jsonData = JSON.parse(j.$('#syncData').text());
          page.handlePage();
        },
      );
    });
  },
};
