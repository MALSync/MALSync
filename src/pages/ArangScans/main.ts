import { pageInterface } from '../pageInterface';

export const ArangScans: pageInterface = {
  name: 'ArangScans',
  domain: 'https://arangscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if ($('div.wp-manga-nav').length > 0) {
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
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      let episodePartAS = utils.urlPart(url, 5);

      if (episodePartAS.match(/volume-\d+/gim)) {
        episodePartAS = utils.urlPart(url, 6);
      }

      const temp = episodePartAS.match(/chapter-\d+/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('ol.breadcrumb li a')
        .last()
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
        return ArangScans.sync.getEpisode(ArangScans.overview!.list!.elementUrl(selector));
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
