import { pageInterface } from '../pageInterface';

export const HoneyManga: pageInterface = {
  name: 'HoneyManga',
  domain: 'https://honey-manga.com.ua/',
  languages: ['Ukrainian'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(utils.urlPart(url, 3) === 'read');
  },
  isOverviewPage(url) {
    return Boolean(utils.urlPart(url, 3) === 'book');
  },
  getImage() {
    return j.$('.w-full.object-cover.object-center').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('.MuiBox-root').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('.MuiBox-root').attr('href') || '';
    },
    getEpisode(url) {
      const val = j
        .$('.justify-center.flex .items-center button:nth-child(2)')
        .text()
        .replace(/(\d)+ - /, '$1');
      return Number(val);
    },
    nextEpUrl(url) {
      // there's no
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('p.text-[18px].mt-2.text-gray-600').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('body > div > div')
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
        return j.$('.hm-book__chapter-list__items a');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        const str = selector
          .find('.text-gray-600')
          .text()
          .replace(/.+(\d+)/, '$1');
        return Number(str);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (HoneyManga.isSyncPage(page.url)) {
        page.handlePage();
      }
      if (HoneyManga.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          function () {
            return j.$('.lazy-load-image-loaded').length > 0;
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};
