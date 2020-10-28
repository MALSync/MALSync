import { pageInterface } from '../pageInterface';

export const NaniScans: pageInterface = {
  name: 'NaniScans',
  domain: 'https://naniscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'chapters') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('a.section')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(NaniScans.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('a.section').attr('href'), NaniScans.domain);
    },
    getEpisode(url) {
      return Number(
        j
          .$('div#chapter-selector div.text')
          .text()
          .trim()
          .replace('Chapter ', ''),
      );
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('i.chevron.right.icon')
          .parent()
          .attr('href'),
        NaniScans.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.ui.centered.header')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.content div.description')
        .first()
        .after(j.html(`<div class="ui hidden divider"></div><div id= "malthing"><h5>MALSync</h5>${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapters div.item');
      },
      elementUrl(selector) {
        return (
          utils.absoluteLink(
            selector
              .find('a')
              .last()
              .attr('href'),
            NaniScans.domain,
          ) || ''
        );
      },
      elementEp(selector) {
        let temp = selector
          .find('a')
          .last()
          .text()
          .trim()
          .match(/(ch\.|chapter)\D?\d+/i);
        if (temp) {
          temp = temp[0].match(/\d+/);
          if (temp) {
            return Number(temp[0]);
          }
        }
        return NaN;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'chapters' ||
        (page.url.split('/')[3] === 'titles' && page.url.split('/')[4] !== undefined)
      ) {
        page.handlePage();
      }
      if (page.url.split('/')[3] === 'titles' && page.url.split('/')[4] !== undefined) {
        utils.changeDetect(
          () => {
            page.handleList();
          },
          () => {
            return j.$('div#chapters div.item').length;
          },
        );
      }
    });
  },
};
