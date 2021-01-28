import { pageInterface } from '../pageInterface';

export const Toonily: pageInterface = {
  name: 'Toonily',
  domain: 'https://toonily.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[5] !== undefined && url.split('/')[5].length >= 9;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.breadcrumb li > a[href*="/manga/"]')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.breadcrumb li > a[href*="/manga/"]').attr('href'), Toonily.domain) || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j.$('.nav-links .nav-next a:not([class^="back"])')!.attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return Toonily.sync.getTitle(url);
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.tab-summary')
        .first()
        .after(
          j.html(
            `<div id="MALSyncheading" class="post-content_item"> <h6 class="text-highlight">MAL-Sync</h6></div><div id="malthing" class="post-content_item">${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.listing-chapters_wrap > ul > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), Toonily.domain);
      },
      elementEp(selector) {
        return Toonily.sync.getEpisode(Toonily.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'manga' &&
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0
      ) {
        page.handlePage();
      }
    });
  },
};
