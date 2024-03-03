import { pageInterface } from '../pageInterface';
import { version5 } from './version5';

export const MangaPark: pageInterface = {
  name: 'MangaPark',
  domain: 'https://mangapark.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(
      url.split('/')[3] === 'comic' && url.split('/')[6] !== undefined && j.$('#viewer').length,
    );
  },
  isOverviewPage(url) {
    if (
      url.split('/')[3] === 'comic' &&
      url.split('/')[4] !== undefined &&
      url.split('/')[4].length > 0
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('h3.nav-title > a')).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(MangaPark.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('h3.nav-title > a').attr('href'), MangaPark.domain);
    },
    getEpisode(url) {
      let string: any = j
        .$('#select-chapters option:selected, #select-episodes option:selected')
        .first()
        .text();
      let temp = string.match(/(ch\.|chapter)\D?\d+/i);
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
      let string: any = j
        .$('#select-chapters option:selected, #select-episodes option:selected')
        .first()
        .text();
      let temp = string.match(/(vol\.|volume)\D?\d+/i);
      if (temp !== null) {
        string = temp[0];
        temp = string.match(/\d+/);
        if (temp !== null) {
          return Number(temp[0]);
        }
      }
      return NaN;
    },
    nextEpUrl(url) {
      const next = utils.absoluteLink(j.$('div.nav-next a').attr('href'), MangaPark.domain);
      if (MangaPark.isSyncPage(next)) {
        return next;
      }
      return '';
    },
    readerConfig: [
      {
        condition: '[href^="?page="].btn-outline',
        current: {
          selector: '[href^="?page="].btn-outline',
          mode: 'text',
        },
        total: {
          selector: '[href^="?page="]:last-of-type',
          mode: 'text',
        },
      },
      {
        current: {
          selector: '[data-name="image-item"] img',
          mode: 'countAbove',
        },
        total: {
          selector: '[data-name="image-item"]:first-child [data-name="image-show"]',
          mode: 'attr',
          attribute: 'style',
          regex: '(\\d+)<\\/text>',
          group: 1,
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('h3.item-title > a').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.episode-list').first().before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if ($('#app-wrapper').length) {
        MangaPark.isSyncPage = version5.isSyncPage;
        MangaPark.isOverviewPage = version5.isOverviewPage;
        MangaPark.sync = version5.sync;
        MangaPark.overview = version5.overview;
        MangaPark.name = version5.name;
        version5.init(page);
        return;
      }

      page.handlePage();
    });
  },
};
