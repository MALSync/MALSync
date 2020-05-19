import { pageInterface } from './../pageInterface';

export const Voiranime: pageInterface = {
  name: 'Voiranime',
  domain: 'http://voiranime.com',
  type: 'anime',
  isSyncPage: function(url) {
    if ($('.video-series-wrap').length) return true;
    return false;
  },
  sync: {
    getTitle: function(url) {
      return $('h1')
        .first()
        .text()
        .trim()
        .split(' – ')[0];
    },
    getIdentifier: function(url) {
      const urlPart3 = utils.urlPart(url, 3);

      if (!urlPart3 || urlPart3.length === 0) return '';

      return urlPart3.replace(/(-saison-[^-]*)?-[^-]*-[^-]*$/i, '');
    },
    getOverviewUrl: function(url) {
      return `${Voiranime.domain}/${Voiranime.sync.getIdentifier(url)}`;
    },
    getEpisode: function(url) {
      return parseInt(
        $('.series-current')
          .first()
          .text()
          .trim(),
      );
    },
    nextEpUrl: function(url) {
      return utils.absoluteLink(
        j
          .$('.series-current')
          .first()
          .closest('li')
          .next()
          .find('a')
          .attr('href'),
        Voiranime.domain,
      );
    },
  },
  overview: {
    getTitle: function(url) {
      return $('h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 3) || '';
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('h1').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('ul.video-series-list > li:not(.series-title)');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Voiranime.domain,
        );
      },
      elementEp: function(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .text()
            .replace(/\D+/, ''),
        );
      },
    },
  },
  init(page) {
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if ($('.video-series-wrap').length || $('.category-anime-serie').length) {
        page.handlePage();
      }
    });
  },
};
