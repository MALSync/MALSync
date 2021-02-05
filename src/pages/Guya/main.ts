import { pageInterface } from '../pageInterface';

export const Guya: pageInterface = {
  name: 'Guya',
  domain: 'https://guya.moe',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'read' && url.split('/')[4] === 'manga' && url.split('/').length >= 8) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'read' && url.split('/')[4] === 'manga' && url.split('/').length >= 6) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#rdr-main > aside > header > h1 > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('#rdr-main > aside > header > h1 > a').attr('href'), Guya.domain);
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 6));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.series-content > article > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('div.series-content > article').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j
          .$('div#detailedView, div#compactView')
          .not('.d-none')
          .first()
          .find('a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href') || '', Guya.domain);
      },
      elementEp(selector) {
        return Guya.sync.getEpisode(Guya.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    let interval;

    let urlWithoutPage = '';
    utils.fullUrlChangeDetect(function() {
      page.reset();
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          if (Guya.overview!.getTitle(window.location.href).length || Guya.sync.getTitle(window.location.href).length) {
            return true;
          }
          return false;
        },
        function() {
          if (
            window.location.href
              .split('/')
              .slice(0, 7)
              .join('/') !== urlWithoutPage
          ) {
            urlWithoutPage = window.location.href
              .split('/')
              .slice(0, 7)
              .join('/');
            page.handlePage();
          }
        },
      );
    });

    j.$(document).on('click', 'div.series-content > div.btn-group', () => {
      page.handleList();
    });
  },
};
