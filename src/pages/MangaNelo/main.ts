import { pageInterface } from './../pageInterface';

export const MangaNelo: pageInterface = {
  name: 'MangaNelo',
  domain: 'https://manganelo.com',
  database: 'MangaNelo',
  type: 'manga',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'chapter') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('div.body-site > div > div.panel-breadcrumb > a:nth-child(3)')
        .text();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl: function(url) {
      return (
        j
          .$('div.body-site > div > div.panel-breadcrumb > a:nth-child(3)')
          .attr('href') || ''
      );
    },
    getEpisode: function(url) {
      return Number(url.split('/')[5].match(/\d+/gim));
    },
    nextEpUrl: function(url) {
      return j
        .$('div.panel-navigation > div > a.navi-change-chapter-btn-next.a-h')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('div.panel-story-info > div.story-info-right > h1').text();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector) {
      j.$(
        `<div id="malthing"> <p id="malp">${selector.html()}</p></div>`,
      ).insertBefore(j.$('div.panel-story-chapter-list').first());
    },

    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$(
          'div.panel-story-chapter-list > ul.row-content-chapter > li.a-h',
        );
      },
      elementUrl: function(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp: function(selector) {
        return selector
          .find('a')
          .first()
          .attr('href')
          .split('/')[5]
          .match(/\d+/gim);
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
      if (
        page.url.split('/')[3] === 'chapter' ||
        page.url.split('/')[3] === 'manga'
      ) {
        page.handlePage();
      }
    });
  },
};
