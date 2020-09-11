import { pageInterface } from '../pageInterface';

export const Readm: pageInterface = {
  name: 'Readm',
  domain: 'https://readm.org',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1.page-title > a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('h1.page-title > a').attr('href'), Readm.domain);
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5)) || 1;
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('#series-tabs > a.item.navigate.ch-next-page.navigate-next').attr('href'),
        Readm.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.page-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return Readm.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#router-view > div > div.ui.grid')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.season-list-column > div.ui.tab div.item tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('h6 > a').attr('href'), Readm.domain);
      },
      elementEp(selector) {
        return Readm.sync.getEpisode(Readm.overview!.list!.elementUrl(selector));
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
