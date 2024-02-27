import { pageInterface } from '../pageInterface';

export const ManhuaUS: pageInterface = {
  name: 'ManhuaUS',
  domain: 'https://manhuaus.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5).length > 0;
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1]).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url.split('/').slice(0, 5).join('/');
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);
      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/chapter-\d+/gim);
      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j.$('div.select-pagination > div.nav-links > div.nav-next > a.next_page').attr('href');
    },
    readerConfig: [
      {
        current: {
          selector: '.reading-content .wp-manga-chapter-img',
          mode: 'countAbove',
        },
        total: {
          selector: '.reading-content .wp-manga-chapter-img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('ol.breadcrumb li a').last().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
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
        return j.$('ul > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), ManhuaUS.domain);
      },
      elementEp(selector) {
        return ManhuaUS.sync.getEpisode(ManhuaUS.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (
        utils.urlPart(page.url, 3) === 'manga' &&
        utils.urlPart(page.url, 4) !== undefined &&
        utils.urlPart(page.url, 4).length > 0
      ) {
        utils.waitUntilTrue(
          function () {
            return !!(j.$('ul > li.wp-manga-chapter').length || j.$('div.wp-manga-nav').length);
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};
