import { pageInterface } from '../pageInterface';

export const AsuraScans: pageInterface = {
  name: 'AsuraScans',
  domain: 'https://asurascans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('#readerarea').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    return url.split('/')[3] === 'comics' && url.split('/')[4] !== '';
  },
  sync: {
    getTitle(url) {
      return j
        .$(j.$('div#content.readercontent div.ts-breadcrumb.bixbox span')[1])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(AsuraScans.sync.getOverviewUrl(url), 4);
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
      return j
        .$('h1.entry-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.bixbox.animefull')
        .first()
        .after(j.html(`<div id= "malthing" class="bixbox animefull">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapterlist li div.chbox');
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
        return AsuraScans.sync.getEpisode(AsuraScans.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (AsuraScans.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          function() {
            return j.$('#chapter > option:selected').length;
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
