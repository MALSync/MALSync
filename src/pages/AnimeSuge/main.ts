import { pageInterface } from '../pageInterface';

export const AnimeSuge: pageInterface = {
  name: 'AnimeSuge',
  domain: 'https://animesuge.io',
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
      return utils.absoluteLink(
        j
          .$('ul.episodes > li > a')
          .first()
          .attr('href'),
        AnimeSuge.domain,
      );
    },
    getEpisode(url) {
      return parseInt(j.$('ul.episodes > li > a.active').attr('data-base')!);
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('ul.episodes > li > a.active')
        .parent('li')
        .next()
        .find('a')
        .attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, AnimeSuge.domain);
    },
    uiSelector(selector) {
      j.$('#episodes').after(j.html(`<section>${selector}</section>`));
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
        return j.$('ul.episodes > li > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeSuge.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-base'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    AnimeSuge.database = '9anime';
    utils.waitUntilTrue(
      function() {
        return j.$('ul.episodes > li').length;
      },
      function() {
        con.info('Start check');
        page.handlePage();
        utils.urlChangeDetect(function() {
          con.info('Check');
          page.handlePage();
        });
      },
    );
  },
};
