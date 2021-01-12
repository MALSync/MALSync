import { pageInterface } from '../pageInterface';

export const Pantsubase: pageInterface = {
  name: 'Pantsubase',
  domain: 'https://pantsubase.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'anime') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.breadcrumb a[href*="/anime/"] > span')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(Pantsubase.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('div.breadcrumb a[href*="/anime/"]').attr('href'), Pantsubase.domain);
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 4);

      const temp = episodePart.match(/-episode-\d*/gi);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('div.theatre-settings > div.row a:contains("Next")').attr('href'),
        Pantsubase.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.info > h1 > div')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.info > h1').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.episode > li.epi-me');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), Pantsubase.domain);
      },
      elementEp(selector) {
        return Pantsubase.sync.getEpisode(Pantsubase.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      utils.waitUntilTrue(
        function() {
          return (
            Pantsubase.sync.getTitle(page.url) ||
            (Pantsubase.overview!.getTitle(page.url) && Pantsubase.overview!.list!.elementsSelector().length)
          );
        },
        function() {
          page.handlePage();
        },
      );
    });
  },
};
