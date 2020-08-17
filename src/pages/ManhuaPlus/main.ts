import { pageInterface } from '../pageInterface';

export const ManhuaPlus: pageInterface = {
  name: 'ManhuaPlus',
  domain: 'https://manhuaplus.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5].indexOf('chapter') >= 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[2])
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[2]).attr('href') || '';
    },
    getEpisode(url) {
      return Number(url.split('/')[5].match(/\d+/gim));
    },
    nextEpUrl(url) {
      return j
        .$('div.entry-header.header > div > div.select-pagination > div.nav-links > div.nav-next > a.next_page')
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$(j.$('ol.breadcrumb li a')[3])
        .text()
        .trim();
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
        return j.$('ul.main.version-chap li.wp-manga-chapter');
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
        return Number(
          selector
            .find('a')
            .first()
            .text()
            .trim()
            .replace('Chapter ', ''),
        );
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
