import { pageInterface } from '../pageInterface';

export const LeviatanScans: pageInterface = {
  name: 'LeviatanScans',
  domain: 'https://leviatanscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if ($('div.wp-manga-nav').length > 0) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (j.$('ul > li.wp-manga-chapter').length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 6);
      if (episodePart.match(/season-\d+/gim)) {
        return Number(utils.urlPart(url, 7));
      }
      return Number(episodePart);
    },
    nextEpUrl(url) {
      return j.$('.nav-links .next_page').attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$(j.$('ol.breadcrumb li a')[2])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
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
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return LeviatanScans.sync.getEpisode(LeviatanScans.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[4] === 'manga' &&
        page.url.split('/')[5] !== undefined &&
        page.url.split('/')[5].length > 0
      ) {
        utils.waitUntilTrue(
          function() {
            if (j.$('ul > li.wp-manga-chapter').length || j.$('div.wp-manga-nav').length) {
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
