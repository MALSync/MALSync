import { pageInterface } from '../pageInterface';

let jsonData;

export const AnimeKO: pageInterface = {
  name: 'AnimeKO',
  domain: 'https://animeko.co',
  languages: ['French'],
  type: 'anime',
  isOverviewPage() {
    return !!j.$('.showcase-shadow').length;
  },
  isSyncPage() {
    return !!j.$('.player-wrap').length;
  },
  sync: {
    getTitle(url) {
      return j.$('.small-card h2').text().trim();
    },
    getIdentifier(url) {
      return AnimeKO.overview!.getIdentifier(AnimeKO.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.small-card h2 a').attr('href'), AnimeKO.domain);
    },
    getEpisode(url) {
      return Number(j.$('.player-releases :selected').text().split(' ')[1]);
    },
    nextEpUrl(url) {
      if (j.$('.btn-next').length) {
        return utils.absoluteLink(j.$('.btn-next').attr('href'), AnimeKO.domain);
      }
      return '';
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
      return j.$('.showcase h1').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getMalUrl() {
      if (jsonData.mal_id) {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
    uiSelector(selector) {
      j.$('.showcase-details').children().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.showcase-small-cards .small-card');
      },
      elementEp(selector) {
        return Number(selector.find('span.badge-number').text());
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), AnimeKO.domain);
      },
    },
  },
  init(page) {
    j.$(function () {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      if (j.$('#malsync').length) {
        jsonData = JSON.parse(j.$('#malsync').text());
      }
      page.handlePage();
    });
  },
};
