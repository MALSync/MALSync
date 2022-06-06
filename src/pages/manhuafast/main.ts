import { pageInterface } from '../pageInterface';

export const manhuafast: pageInterface = {
  name: 'manhuafast',
  domain: 'https://manhuafast.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[5] !== undefined && url.split('/')[5].length > 0;
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1]).text().trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return url.split('/').slice(0, 5).join('/');
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
        .$("option:contains('Chapter')")
        .first()
        .parent()
        .find(':selected')
        .prev()
        .attr('data-redirect');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('ol.breadcrumb li a').last().text().trim();
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
        return j.$('ul > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), manhuafast.domain);
      },
      elementEp(selector) {
        return manhuafast.sync.getEpisode(manhuafast.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (
        page.url.split('/')[3] === 'manga' &&
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0
      ) {
        utils.waitUntilTrue(
          function () {
            if (j.$('ul > li.wp-manga-chapter').length || j.$('div.wp-manga-nav').length) {
              return true;
            }
            return false;
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};
