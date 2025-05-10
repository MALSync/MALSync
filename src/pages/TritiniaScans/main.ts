import { PageInterface } from '../pageInterface';

export const TritiniaScans: PageInterface = {
  name: 'TritiniaScans',
  domain: 'https://tritinia.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('.reading-manga .chapter-type-manga').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (j.$('.manga-page .profile-manga').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1]).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      let episodePart = utils.urlPart(url, 5);

      if (episodePart.match(/(volume|season)-\d+/gim)) {
        episodePart = utils.urlPart(url, 6);
      }

      const temp = episodePart.match(/ch-\d+/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('div.chapter-selection.chapters_selectbox_holder option.short[selected="selected"]')
        .first()
        .prev()
        .attr('data-redirect');
    },
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
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return TritiniaScans.sync.getEpisode(TritiniaScans.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (TritiniaScans.isSyncPage(page.url)) {
        page.handlePage();
      }
      if (TritiniaScans.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          function () {
            return j.$('.wp-manga-chapter').length > 0;
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};
