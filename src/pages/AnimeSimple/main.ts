import { pageInterface } from '../pageInterface';

let jsonData;

export const AnimeSimple: pageInterface = {
  name: 'AnimeSimple',
  domain: 'https://ww1.animesimple.com',
  database: 'AnimeSimple',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page && jsonData.page === 'episode';
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
      return jsonData.episode;
    },
    nextEpUrl(url) {
      if (jsonData.next_episode_url) {
        return jsonData.next_episode_url;
      }
      return '';
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return AnimeSimple.sync.getTitle(url);
    },
    getIdentifier(url) {
      return AnimeSimple.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position)
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      return AnimeSimple.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episode-list > a');
      },
      elementUrl(selector) {
        return selector.attr('href') || '';
      },
      elementEp(selector) {
        const text = utils.getBaseText($(selector));
        if (!text.toLowerCase().includes('episode')) return NaN;
        return Number(text.replace(/\D+/g, ''));
      },
      paginationNext(updateCheck) {
        con.log('updatecheck', updateCheck);
        let el;
        if (updateCheck) {
          el = j.$('ul.pagination  > li.page-item > a').last();
          if (typeof el[0] === 'undefined' || el.hasClass('active')) {
            return false;
          }
          el[0].click();
          return true;
        }
        el = j
          .$('ul.pagination  > li.active.page-item')
          .next('li')
          .find('a');
        if (typeof el[0] === 'undefined') {
          return false;
        }
        el[0].click();
        return true;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      utils.waitUntilTrue(
        function() {
          return j.$('#syncData').length;
        },
        function() {
          jsonData = JSON.parse(j.$('#syncData').text());
          page.handlePage();
        },
      );
    });
  },
};
