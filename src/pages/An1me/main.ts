import { pageInterface } from '../pageInterface';

export const An1me: pageInterface = {
  name: 'An1me',
  domain: 'https://an1me.nl',
  languages: ['Greek'],
  type: 'anime',
  isSyncPage(url) {
    const breadcrumbElement = j.$('#manga-reading-nav-head > div > div.entry-header_wrap > div > div.c-breadcrumb');
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0 && breadcrumbElement.length !== 0) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    const titleElement = j.$('div.site-content > div > div.profile-manga > div > div > div > div.post-title > h1');

    if (!url.split('/')[4] || titleElement.length === 0) return false;

    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('ol.breadcrumb > li:nth-child(2) > a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).toString();
    },
    getOverviewUrl(url) {
      return j.$('ol.breadcrumb > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d+/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$('div.select-pagination > div > div.nav-next > a').attr('href');
      if (href) {
        if (An1me.sync.getEpisode(url) < An1me.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
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
            `<div id="malthing">
              <div id= "MALSyncheading" class="c-blog__heading style-2 font-heading">
                <h2 class="h4">
                  <i class="icon ion-ios-star"></i>
                  MAL-Sync
                </h2>
              </div>
              ${selector}
            </div>`,
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
          An1me.domain,
        );
      },
      elementEp(selector) {
        return An1me.sync.getEpisode(An1me.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[4] !== undefined && page.url.split('/')[4].length > 0) page.handlePage();
    });
  },
};
