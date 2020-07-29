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
      url = url.split('/')[4].split('?')[0];
      if (url.indexOf('.') > -1) {
        url = url.split('.')[1];
      }
      return url;
    },
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      return parseInt(j.$('.servers .episodes a.active').attr('data-base')!);
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('.servers .episodes a.active')
        .parent('li')
        .next()
        .find('a')
        .attr('href');
      if (!nextEp) return nextEp;
      return nineAnime.domain + nextEp;
    },
    uiSelector(selector) {
      j.$('.widget.info')
        .first()
        .before(j.html(`<div class="widget info"><div class="widget-body"> ${selector}</div></div>`));
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
        return j.$('.episodes.range a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), nineAnime.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-base'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    utils.waitUntilTrue(
      function() {
        return j.$('.servers').length;
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
