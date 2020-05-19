import { pageInterface } from './../pageInterface';

export const MangaPark: pageInterface = {
  name: 'MangaPark',
  domain: 'https://mangapark.net',
  type: 'manga',
  isSyncPage: function(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return utils
        .getBaseText(
          $(
            'body > section.page > div > div.switch > div:nth-child(1) > div.path > span > a',
          ),
        )
        .trim()
        .replace(/\w+$/g, '')
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl: function(url) {
      return utils.absoluteLink(
        j
          .$(
            'body > section.page > div > div.switch > div:nth-child(1) > div.path > span > a',
          )
          .attr('href'),
        MangaPark.domain,
      );
    },
    getEpisode: function(url) {
      let string = utils
        .getBaseText(
          $(
            'body > section.page > div > div.switch > div:nth-child(1) > div.path > span',
          ),
        )
        .trim();
      let temp = [];
      temp = string.match(/(ch\.|chapter)\D?\d+/i);
      if (temp !== null) {
        string = temp[0];
        temp = string.match(/\d+/);
        if (temp !== null) {
          return temp[0];
        }
      }
      return NaN;
    },
    getVolume: function(url) {
      let string = utils
        .getBaseText(
          $(
            'body > section.page > div > div.switch > div:nth-child(1) > div.path > span',
          ),
        )
        .trim();
      let temp = [];
      temp = string.match(/(vol\.|volume)\D?\d+/i);
      if (temp !== null) {
        string = temp[0];
        temp = string.match(/\d+/);
        if (temp !== null) {
          return temp[0];
        }
      }
      return NaN;
    },
    nextEpUrl: function(url) {
      if (
        j
          .$(
            'body > section.page > div.content > div.board > div.info > div:nth-child(1) > p:nth-child(3) > span',
          )
          .text() === 'Next Chapter:'
      ) {
        return utils.absoluteLink(
          j
            .$(
              'body > section.page > div.content > div.board > div.info > div:nth-child(1) > p:nth-child(3) > a',
            )
            .attr('href'),
          MangaPark.domain,
        );
      }
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('body > section.manga > div.container.content > div > h2 > a')
        .first()
        .text()
        .trim()
        .replace(/\w+$/g, '')
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector) {
      selector.insertBefore(
        j
          .$('body > section.manga > div.container.content > div.hd.sub')
          .first(),
      );
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
      if (page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
