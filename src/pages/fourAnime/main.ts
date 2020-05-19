import { pageInterface } from './../pageInterface';

export const fourAnime: pageInterface = {
  name: '4Anime',
  domain: 'https://4anime.to',
  type: 'anime',
  isSyncPage: function(url) {
    if (j.$('.singletitletop')[0] && j.$('.episodes')[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('span.singletitletop a')
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      const urlPart3 = utils.urlPart(url, 3);

      if (!urlPart3) return '';

      return urlPart3.replace(/\-episode[^]*$/g, '');
    },
    getOverviewUrl: function(url) {
      return `${fourAnime.domain}/anime/${fourAnime.sync.getIdentifier(url)}`;
    },
    getEpisode: function(url) {
      return Number(
        j
          .$('ul.episodes a.active')
          .text()
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl: function(url) {
      const href = j
        .$('.anipager-next a')
        .first()
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, fourAnime.domain);
      }
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('p.single-anime-desktop')
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      const urlPart4 = utils.urlPart(url, 4);

      if (!urlPart4) return '';

      return urlPart4.replace(/\-episode[^]*$/g, '');
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('p.description-mobile').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('.episodes.range a');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(selector.attr('href'), fourAnime.domain);
      },
      elementEp: function(selector) {
        return Number(selector.text());
      },
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (
        (j.$('.singletitletop')[0] && j.$('.episodes')[0]) ||
        page.url.split('/')[3] === 'anime'
      ) {
        page.handlePage();
      }
    });
  },
};
