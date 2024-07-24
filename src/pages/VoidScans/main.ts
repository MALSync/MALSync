import { pageInterface } from '../pageInterface';

export const VoidScans: pageInterface = {
  name: 'VoidScans',
  domain: ['https://hivetoon.com/', 'https://void-scans.com'],
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(j.$('#readerarea').length);
  },
  isOverviewPage(url) {
    return j.$('.info-desc.bixbox').length > 0;
  },
  sync: {
    getTitle(url) {
      return j.$('.allc a').first().text().trim();
    },
    getIdentifier(url) {
      return VoidScans.overview!.getIdentifier(VoidScans.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return j.$(j.$('div#content.readercontent div.ts-breadcrumb.bixbox a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = j.$('#chapter > option:selected').text();

      const temp = episodePart.match(/cha?p?t?e?r?\s*(\d+)/i);

      if (!temp || temp.length < 2) return 1;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const next = j.$('a.ch-next-btn').attr('href');

      if (next === '#/next/') return undefined;

      return next;
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.entry-title').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).replace(/^\d+-/gi, '');
    },
    uiSelector(selector) {
      j.$('.info-desc.bixbox')
        .first()
        .after(j.html(`<div id= "malthing" class="bixbox animefull">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapterlist li div.chbox');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        const elementEpN = selector.find('span').first().text();

        const temp = elementEpN.match(/chapter \d+/gim);

        if (!temp || temp.length === 0) return 0;

        return Number(temp[0].replace(/\D+/g, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('Page not found')) {
        con.error('404');
        return;
      }

      if (VoidScans.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          function () {
            if (
              j.$('#chapter > option:selected').length &&
              j.$('#chapter > option:selected').text() !== 'Select Chapter'
            )
              return true;
            return false;
          },
          function () {
            page.handlePage();
          },
        );
      } else {
        page.handlePage();
      }
    });
  },
};
