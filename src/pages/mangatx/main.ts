import { pageInterface } from '../pageInterface';

export const mangatx: pageInterface = {
  name: 'mangatx',
  domain: 'https://mangatx.com',
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
      return j
        .$('div.entry-header.header > div > div.entry-header_wrap > div > div.c-breadcrumb > ol > li:nth-child(2) > a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return (
        j
          .$(
            'div.entry-header.header > div > div.entry-header_wrap > div > div.c-breadcrumb > ol > li:nth-child(2) > a',
          )
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('div.entry-header.header > div > div.select-pagination > div.nav-links > div.nav-next > a.next_page')
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return utils.getBaseText(j.$('div.profile-manga > div > div > div > div.post-title > h1')).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('div.c-page__content div.c-blog__heading')
        .first()
        .before(
          j.html(
            `<div id="malthing"><div id= "MALSyncheading" class="c-blog__heading style-2 font-heading"><h2 class="h4"> <i class="icon ion-ios-star"></i> MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.page-content-listing.single-page > div > ul > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          mangatx.domain,
        );
      },
      elementEp(selector) {
        return mangatx.sync.getEpisode(mangatx.overview!.list!.elementUrl(selector));
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
