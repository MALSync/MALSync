import { pageInterface } from '../pageInterface';

export const MangaPark: pageInterface = {
  name: 'MangaPark',
  domain: 'https://mangapark.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils
        .getBaseText($('body > section.page > div > div.switch > div:nth-child(1) > div.path > span > a'))
        .trim()
        .replace(/\w+$/g, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('body > section.page > div > div.switch > div:nth-child(1) > div.path > span > a').attr('href'),
        MangaPark.domain,
      );
    },
    getEpisode(url) {
      let string = utils
        .getBaseText($('body > section.page > div > div.switch > div:nth-child(1) > div.path > span'))
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
    getVolume(url) {
      let string = utils
        .getBaseText($('body > section.page > div > div.switch > div:nth-child(1) > div.path > span'))
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
    nextEpUrl(url) {
      if (
        j
          .$('body > section.page > div.content > div.board > div.info > div:nth-child(1) > p:nth-child(3) > span')
          .text() === 'Next Chapter:'
      ) {
        return utils.absoluteLink(
          j
            .$('body > section.page > div.content > div.board > div.info > div:nth-child(1) > p:nth-child(3) > a')
            .attr('href'),
          MangaPark.domain,
        );
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('body > section.manga > div.container.content > div > h2 > a')
        .first()
        .text()
        .trim()
        .replace(/\w+$/g, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('body > section.manga > div.container.content > div.hd.sub')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
