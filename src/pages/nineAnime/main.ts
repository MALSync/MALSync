import { pageInterface } from '../pageInterface';

export const nineAnime: pageInterface = {
  name: '9anime',
  domain: 'https://9anime.to',
  database: '9anime',
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
      url = utils.urlPart(url, 4);
      if (url.indexOf('.') > -1) {
        url = url.split('.')[1];
      }
      return url;
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('ul.ep-range > li > a').first().attr('href'), nineAnime.domain);
    },
    getEpisode(url) {
      return parseInt(j.$('ul.ep-range > li > a.active').attr('data-num')!);
    },
    nextEpUrl(url) {
      const nextEp = j.$('ul.ep-range > li > a.active').parent('li').next().find('a').attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, nineAnime.domain);
    },
    uiSelector(selector) {
      j.$('#w-media').after(j.html(`<div>${selector}</div>`));
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
        return j.$('ul.ep-range > li:not([style*="display: none"]) > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), nineAnime.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-num'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      function () {
        return j.$('ul.ep-range li').length;
      },
      function () {
        con.info('Start check');
        page.handlePage();

        utils.urlChangeDetect(function () {
          con.info('Check');
          page.reset();
          page.handlePage();
        });

        // utils.changeDetect(
        //   () => {
        //     page.reset();
        //     page.handlePage();
        //   },
        //   () => {
        //     return nineAnime.sync.getEpisode(window.location.href);
        //   },
        // );

        utils.changeDetect(
          () => {
            page.handleList();
          },
          () => {
            return j.$('#w-episodes div.dropdown.filter.type > button').text();
          },
        );
      },
    );
  },
};
