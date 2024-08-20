import { pageInterface } from '../pageInterface';

export const AnimeSuge: pageInterface = {
  name: 'AnimeSuge',
  domain: 'https://animesuge.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('h1.title').text();
    },
    getIdentifier(url) {
      const splitUrl = utils.urlPart(url, 4).split('-');
      return splitUrl[splitUrl.length - 1];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.range-wrap a').first().attr('href'), AnimeSuge.domain);
    },
    getEpisode(url) {
      return parseInt(j.$('.range-wrap a.active').attr('data-slug')!);
    },
    nextEpUrl(url) {
      const nextEp = j.$('.range-wrap a.active').parent('div').next().find('a').attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, AnimeSuge.domain);
    },
    uiSelector(selector) {
      j.$('#media-episode').after(j.html(selector));
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
        return j.$('.range-wrap a:not([style*="display: none"])');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeSuge.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-slug'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      function () {
        const loaded = j
          .$('.range-wrap .range')
          .toArray()
          .some(el => el.style.display !== 'none');

        return loaded && j.$('.range-wrap .active').length;
      },
      function () {
        con.info('Start check');
        page.handlePage();
        utils.urlChangeDetect(function () {
          con.info('Check');
          page.reset();
          page.handlePage();
        });

        utils.changeDetect(
          () => {
            page.handleList();
          },
          () => {
            return (
              (j.$('#media-episode .lang-select [data-value="sub"]').attr('class') || '') +
              (j.$('#media-episode .lang-select [data-value="dub"]').attr('class') || '')
            );
          },
        );
      },
    );
  },
};
