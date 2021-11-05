import { pageInterface } from '../pageInterface';

export const AlphaScans: pageInterface = {
  name: 'AlphaScans',
  domain: 'https://Alpha-Scans.org',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('#readerarea').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'manga' && utils.urlPart(url, 4) !== '';
  },
  sync: {
    getTitle(url) {
      return j
        .$(j.$('#content.readercontent .ts-breadcrumb.bixbox span')[1])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(AlphaScans.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('#content.readercontent .ts-breadcrumb.bixbox a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = j.$('#chapter > option:selected').text();

      const temp = episodePart.match(/cha?p?t?e?r?\s*(\d+)/i);

      if (!temp || temp.length < 2) return 1;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const next = j.$('.ch-next-btn').attr('href');

      if (next === '#/next/') return undefined;

      return next;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.entry-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.info-desc.bixbox')
        .first()
        .after(j.html(`<div id= "malthing" class="bixbox animefull">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapterlist li .chbox');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
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
      if (AlphaScans.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          function() {
            if (
              j.$('#chapter > option:selected').length &&
              j.$('#chapter > option:selected').text() !== 'Select Chapter'
            )
              return true;
            return false;
          },
          function() {
            page.handlePage();
          },
        );
      } else {
        page.handlePage();
      }
    });
  },
};
