import { pageInterface } from '../pageInterface';

export const Isekaiscan: pageInterface = {
  name: 'Isekaiscan',
  domain: 'https://isekaiscan.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(
      utils.urlPart(url, 3) === 'manga' &&
        utils.urlPart(url, 5) &&
        utils.urlPart(url, 5).startsWith('chapter-'),
    );
  },
  isOverviewPage(url) {
    return Boolean(utils.urlPart(url, 3) === 'manga' && !utils.urlPart(url, 5));
  },
  getImage() {
    return j.$('div.summary_image img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('.c-breadcrumb-wrapper .breadcrumb li')[1]).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$(j.$('.c-breadcrumb-wrapper .breadcrumb li a')[1]).attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j.$('.nav-links .next_page').first().attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.post-title h1').prop('innerText').trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.c-page__content div.c-blog__heading')
        .first()
        .before(
          j.html(
            `<div id="c-blog__heading style-2 font-heading malthing"><div id= "MALSyncheading" class="c-blog__heading style-2 font-heading"><h2 class="h4"> <i class="icon ion-ios-star"></i> MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.wp-manga-chapter');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return Isekaiscan.sync.getEpisode(Isekaiscan.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (Isekaiscan.isSyncPage(page.url)) {
        page.handlePage();
      }
      if (Isekaiscan.isOverviewPage!(page.url)) {
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
