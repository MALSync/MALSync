import { pageInterface } from '../pageInterface';

export const Zoro: pageInterface = {
  name: 'Zoro',
  domain: 'https://zoro.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'watch';
  },
  isOverviewPage(url) {
    return Boolean(j.$('#ani_detail').length && j.$('[data-page="detail"]').length);
  },
  sync: {
    getTitle(url) {
      return Zoro.overview!.getTitle(url);
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.anisc-detail .film-name a').attr('href'), Zoro.domain);
    },
    getEpisode(url) {
      return Number(
        j
          .$('.ss-list > a.active')
          .first()
          .attr('data-number'),
      );
    },
    nextEpUrl(url) {
      const num = $('.ss-list')
        .find('a.active')
        .next()
        .attr('href');

      if (!num) return '';

      return utils.absoluteLink(num, Zoro.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.anisc-detail .film-name')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('.film-name')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.ss-list > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Zoro.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-number'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (Zoro.isOverviewPage!(page.url)) {
        page.handlePage();
      } else if (Zoro.isSyncPage!(page.url)) {
        utils.waitUntilTrue(
          () => !$('#episodes-content .loading-box').length,
          () => {
            page.handlePage();
            let _debounce;
            utils.changeDetect(
              () => {
                clearTimeout(_debounce);
                _debounce = setTimeout(() => {
                  page.reset();
                  page.handlePage();
                }, 500);
              },
              () => Zoro.sync.getEpisode(page.url),
            );
          },
        );
      }
    });
  },
};
