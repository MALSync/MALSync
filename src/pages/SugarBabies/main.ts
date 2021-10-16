import { pageInterface } from '../pageInterface';

export const SugarBabies: pageInterface = {
  name: 'SugarBabies',
  domain: 'https://sugarbscan.com/',
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
  getImage() {
    return j.$('div.summary_image img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j
        .$('.c-breadcrumb-wrapper .breadcrumb li')
        .last()
        .prev()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return (
        j
          .$('.c-breadcrumb-wrapper .breadcrumb li a')
          .last()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('.nav-links .next_page')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.summary-content.vote-details .rate-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.c-page__content .c-blog__heading')
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
        return j.$('.wp-manga-chapter');
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
        return SugarBabies.sync.getEpisode(SugarBabies.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(() => {
      if (SugarBabies.isSyncPage(page.url)) {
        page.handlePage();
      }
      if (SugarBabies.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          function() {
            return j.$('.wp-manga-chapter').length > 0;
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
