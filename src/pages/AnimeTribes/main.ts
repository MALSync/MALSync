import { pageInterface } from '../pageInterface';

export const AnimeTribes: pageInterface = {
  name: 'AnimeTribes',
  domain: 'https://animetribes.ru',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch' && url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.video-info-title > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('#dropdown-menu > div.dropdown-content > a')
          .last()
          .attr('href'),
        AnimeTribes.domain,
      );
    },
    getEpisode(url) {
      if (!utils.urlPart(url, 5)) {
        return 1;
      }
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('nav.pagination span.typcn.typcn-media-fast-forward')
          .parent('a')
          .attr('href'),
        AnimeTribes.domain,
      );
    },
    uiSelector(selector) {
      j.$('div.video-info-title > h1').after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // no Ui
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#dropdown-menu > div.dropdown-content > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeTribes.domain);
      },
      elementEp(selector) {
        return AnimeTribes.sync.getEpisode(AnimeTribes.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
