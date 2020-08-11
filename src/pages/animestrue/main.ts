import { pageInterface } from '../pageInterface';

export const animestrue: pageInterface = {
  name: 'animestrue',
  domain: 'https://animestrue.site',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (typeof url.split('/')[6] !== 'undefined' && url.split('/')[6].indexOf('episodio') !== -1) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (Number(url.split('/')[5].match(/\d+/gim)) > 1) {
        return `${utils.getBaseText($('div.anime-nome > a, #pageTitle').first())} season ${url
          .split('/')[5]
          .match(/\d+/gim)}`;
      }

      return utils.getBaseText($('div.anime-nome > a, #pageTitle').first());
    },
    getIdentifier(url) {
      return `${url.split('/')[4]}?s=${url.split('/')[5].match(/\d+/gim)}`;
    },
    getOverviewUrl(url) {
      return `${animestrue.domain}/anime/${url.split('/')[4]}/${url.split('/')[5]}`;
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 6).match(/\d+/gim));
    },
  },
  overview: {
    getTitle(url) {
      return animestrue.sync.getTitle(url);
    },
    getIdentifier(url) {
      return animestrue.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#pageTitle')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#listar_animes > li > div > div > table > tbody > tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('td > a')
            .first()
            .attr('href'),
          animestrue.domain,
        );
      },
      elementEp(selector) {
        return animestrue.sync.getEpisode(
          utils.absoluteLink(
            selector
              .find('td > a')
              .first()
              .attr('href'),
            animestrue.domain,
          ),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let Interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(Interval);
      Interval = utils.waitUntilTrue(
        function() {
          if (j.$('div.anime-nome > a, #pageTitle').length && j.$('div.anime-nome > a, #pageTitle').text()) {
            return true;
          }
          return false;
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};
