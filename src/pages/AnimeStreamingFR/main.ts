import { pageInterface } from '../pageInterface';

export const AnimeStreamingFR: pageInterface = {
  name: 'AnimeStreamingFR',
  domain: 'https://beta.animestreamingfr.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'episode';
  },
  sync: {
    getTitle(url) {
      return j.$('#animeTitle').text().trim();
    },
    getIdentifier(url) {
      const overviewUrl = `${j.$('#animeTitle').parent().attr('href')}`;
      return `${utils.urlPart(overviewUrl, 3)}-${utils.urlPart(overviewUrl, 5)}`;
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(`${j.$('#animeTitle').parent().attr('href')}`, AnimeStreamingFR.domain);
    },
    getEpisode(url) {
      return Number(j.$('meta[itemprop="episodeNumber"]').attr('content'));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(j.$('#nextEpisode').parent().attr('href'), AnimeStreamingFR.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#season').text().trim();
    },
    getIdentifier(url) {
      return `${utils.urlPart(url, 5)}-${utils.urlPart(url, 7)}`;
    },
    uiSelector(selector) {
      j.$('#season').parent().parent().parent().after(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('[itemprop="episode"]').parent();
      },
      elementUrl(selector) {
        return utils.absoluteLink(`${selector.attr('href')}`, AnimeStreamingFR.domain);
      },
      elementEp(selector) {
        return Number(selector.find('[itemprop="episodeNumber"]').text());
      },
    },
  },
  init(page) {
    j.$(document).ready(function () {
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      page.handlePage();
      utils.urlChangeDetect(function () {
        page.reset();
        if (utils.urlPart(page.url, 3) === 'episode' || utils.urlPart(page.url, 3) === 'anime') {
          page.handlePage();
        }
      });
    });
  },
};
