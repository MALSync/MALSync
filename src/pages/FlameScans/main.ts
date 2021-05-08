import { pageInterface } from '../pageInterface';

export const FlameScans: pageInterface = {
  name: 'FlameScans',
  domain: 'https://flamescans.org',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('div#content.readercontent').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$(j.$('div#content.readercontent div.ts-breadcrumb.bixbox span')[1])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(FlameScans.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('div#content.readercontent div.ts-breadcrumb.bixbox a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      const elementEpN = j
        .$('select#chapter option[selected="selected"]')
        .first()
        .text();

      const temp = elementEpN.match(/chapter \d+/gim);

      if (!temp || temp.length === 0) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const next = j.$('a.ch-next-btn').attr('href');

      if (next === '#/next/') return undefined;

      return next;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.entry-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.info-desc.bixbox')
        .first()
        .after(j.html(`<div id= "malthing" class="bixbox animefull">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapterlist li div.chbox');
      },
      elementUrl(selector) {
        return selector.parent().attr('href') || '';
      },
      elementEp(selector) {
        const elementEpN = selector
          .find('span')
          .first()
          .text();

        const temp = elementEpN.match(/chapter \d+/gim);

        if (!temp || temp.length === 0) return 0;

        return Number(temp[0].replace(/\D+/g, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'series' && page.url.split('/')[4] !== '') {
        page.handlePage();
      }
      if (j.$('div#content.readercontent').length) {
        utils.waitUntilTrue(
          function() {
            if (j.$('select#chapter option[selected="selected"]').first().length) {
              return true;
            }
            return false;
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
