import { pageInterface } from '../pageInterface';

export const MerakiScans: pageInterface = {
  name: 'MerakiScans',
  domain: 'https://merakiscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'manga' && url.split('/')[6] !== undefined) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1#reader_text a')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('h1#reader_text a')
          .first()
          .attr('href'),
        MerakiScans.domain,
      );
    },
    getEpisode(url) {
      return Number(url.split('/')[5]);
    },
    nextEpUrl(url) {
      const nextChap: any = j
        .$('#chapter_select option:selected')
        .next()
        .val();

      if (nextChap === undefined) {
        return undefined;
      }

      const urlSplit = url.split('/');
      urlSplit.splice(5, 1, nextChap);

      return urlSplit.join('/');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('b#manga_name').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.tab')
        .first()
        .before(j.html(`<div id="malthing"><b id="MALSync">MALSync</b>${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('tr#chapter-head');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('data-href'), MerakiScans.domain);
      },
      elementEp(selector) {
        return Number(MerakiScans.overview!.list!.elementUrl(selector).split('/')[5]);
      },
      paginationNext(updateCheck) {
        con.log('updatecheck', updateCheck);
        if (updateCheck) {
          return false;
        }
        const el = j.$('#chapter_table_paginate > span > a.paginate_button.current').next('a');
        if (typeof el[0] === 'undefined') {
          return false;
        }
        el[0].click();
        return true;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'manga' &&
        (page.url.split('/').length === 6 || page.url.split('/').length === 7)
      ) {
        page.handlePage();
      }
    });
  },
};
