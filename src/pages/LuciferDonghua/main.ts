import { pageInterface } from '../pageInterface';

export const LuciferDonghua: pageInterface = {
  name: 'Lucifer Donghua',
  domain: 'https://luciferdonghua.in',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return url.indexOf('-episode-') > -1 || url.indexOf('-ep-') > -1;
  },
  isOverviewPage(url) {
    return url.indexOf('/anime') > -1;
  },
  sync: {
    getTitle(url) {
      return (j.$('.det a').text() || '').split('[')[0];
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3).split(url.indexOf('-episode-') > -1 ? '-episode-' : '-ep-')[0];
    },
    getOverviewUrl(url) {
      return j.$('.det a').attr('href') || '';
    },
    getEpisode(url) {
      const ep = utils.urlPart(url, 3).match(/episode-(\d+)/i);
      if (ep && ep.length > 1) {
        return parseInt(ep[1]);
      }
      const ep2 = utils.urlPart(url, 3).match(/ep-(\d+)/i);
      if (ep2 && ep2.length > 1) {
        return parseInt(ep2[1]);
      }
      return NaN;
    },
    nextEpUrl(url) {
      return j.$('a[rel=next]').attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return (j.$('h1.entry-title').text() || '').split('[')[0];
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.ts-breadcrumb').append(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.eplister ul > li > a') || j.$('.episodelist ul > li > a');
      },
      elementUrl(selector) {
        return selector.attr('href') || '';
      },
      elementEp(selector) {
        const ep = selector
          .children('.playinfo h4')
          .first()
          .text()
          .match(/Episode [0-9]+/);
        if (ep) {
          return parseInt(ep[0].replace(/\D+/g, ''));
        }
        return Number(selector.children('.epl-num').first().text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() =>
      utils.waitUntilTrue(
        () => {
          return j.$('h1.entry-title');
        },
        () => {
          con.info('Start check');
          page.handlePage();
        },
      ),
    );
  },
};
