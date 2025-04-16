import { PageInterface } from '../pageInterface';

function cleanUpTitle(title: string) {
  return title.replace(' - Partie 1', '').trim();
}

export const AnimeStreamingFR: PageInterface = {
  name: 'AnimeStreamingFR',
  domain: 'https://beta.animestreamingfr.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'episode';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'anime';
  },
  sync: {
    getTitle(url) {
      return cleanUpTitle(j.$('#animeTitle').text().trim());
    },
    getIdentifier(url) {
      return AnimeStreamingFR.overview!.getIdentifier(AnimeStreamingFR.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        `${j.$('#animeTitle').parent().attr('href')}`,
        AnimeStreamingFR.domain,
      );
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
      return cleanUpTitle(j.$('#season').text().trim());
    },
    getIdentifier(url) {
      return `${utils.urlPart(url, 5)}-${utils.urlPart(url, 7)}`;
    },
    uiSelector(selector) {
      j.$('#season')
        .parent()
        .parent()
        .parent()
        .after(
          j.html(`<div class="Grid-item" style="width: 100%; max-width: 800px;">${selector}</div>`),
        );
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
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
      utils.urlChangeDetect(function () {
        page.reset();
        page.handlePage();
      });
    });
  },
};
