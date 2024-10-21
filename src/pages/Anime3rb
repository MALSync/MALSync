import { pageInterface } from '../pageInterface';

export const Anime3rb: pageInterface = {
  domain: 'https://anime3rb.com',
  languages: ['Arabic'],
  name: 'Anime3rb',
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'episode' && utils.urlPart(url, 4).length !== 0;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'anime' && utils.urlPart(url, 4).length !== 0;
  },
  sync: {
    getTitle(url) {
      return j.$('div.anime-page-link a').text();
    },
    getIdentifier(url) {
      return Anime3rb.overview!.getIdentifier(Anime3rb.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('div.anime-page-link a').attr('href'), Anime3rb.domain);
    },
    getEpisode(url) {
      return Number(j.$('.all-episodes-list .episode-active a').text().replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return utils.absoluteLink($('div.next-episode a').attr('href'), Anime3rb.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.anime-details-title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1.anime-details-title').before(j.html(selector));
    },
    getMalUrl(provider) {
      return j.$('div.anime-external-links a.anime-mal').attr('href') ?? '';
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      page.handlePage();
    });
  },
};
