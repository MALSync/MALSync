import { pageInterface } from '../pageInterface';

export const AsuraScans: pageInterface = {
  name: 'AsuraScans',
  domain: 'https://asurascans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3].indexOf('chapter') >= 0) {
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
      return utils.urlPart(AsuraScans.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('div#content.readercontent div.ts-breadcrumb.bixbox a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 3);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || temp.length === 0) return 1;

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
      if (
        page.url.split('/')[3].indexOf('chapter') >= 0 ||
        (page.url.split('/')[3] === 'manga' && page.url.split('/')[4] !== '')
      ) {
        page.handlePage();
      }
    });
  },
};
