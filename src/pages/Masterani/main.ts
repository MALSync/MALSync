import { pageInterface } from '../pageInterface';

export const Masterani: pageInterface = {
  name: 'Masterani',
  domain: 'https://www.masterani.me',
  database: 'Masterani',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[4] !== 'watch') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.info h1')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('.info a')
          .first()
          .attr('href'),
        Masterani.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 6) || '');
    },
    nextEpUrl(url) {
      const nexUrl =
        Masterani.domain +
        (j
          .$('#watch .anime-info .actions a')
          .last()
          .attr('href') || '');
      if (!Masterani.isSyncPage(nexUrl)) {
        return undefined;
      }
      return nexUrl;
    },
  },
  overview: {
    getTitle(url) {
      return Masterani.sync.getIdentifier(url).replace(/^\d*-/, '');
    },
    getIdentifier(url) {
      return Masterani.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#stats')
        .first()
        .prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episodes .thumbnail');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Masterani.domain,
        );
      },
      elementEp(selector) {
        return Masterani.sync.getEpisode(Masterani.overview!.list!.elementUrl(selector));
      },
      paginationNext() {
        const el = j.$('.pagination .item').last();
        if (el.hasClass('disabled')) {
          return false;
        }
        el[0].click();
        return true;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    utils.waitUntilTrue(
      function() {
        return j.$('#stats,#watch').length;
      },
      function() {
        page.handlePage();

        j.$('.ui.toggle.checkbox, .pagination.menu').click(function() {
          setTimeout(function() {
            page.handleList();
          }, 500);
        });
      },
    );
  },
};
