import { pageInterface } from '../pageInterface';

export const Japanread: pageInterface = {
  name: 'Japanread',
  domain: 'https://www.japanread.cc/',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[5] !== undefined;
  },
  sync: {
    getTitle(url) {
      const title = '.reader-controls-title > div > a';
      return j
        .$(title)
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      const overview = url.substr(0, url.lastIndexOf('/'));
      return overview;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
  },
  overview: {
    getTitle() {
      return j
        .$('h1.card-header')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.container .row .col-12 .card.card-manga.mb-3 .card-body.p-0 .row.edit .col-xl-9.col-lg-8.col-md-7.pt-2')
        .first()
        .append(
          j.html(
            '<div class="row m-0 py-1 px-0 border-top"><div class="col-lg-3 col-xl-2 strong">MAL-Sync:</div><div class="col-lg-9 col-xl-10 mal-sync"></div></div>',
          ),
        );
      j.$('.container .card .mal-sync')
        .first()
        .append(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.chapter-container > .row:not(:first-of-type) .chapter-row');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Japanread.domain,
        );
      },
      elementEp(selector) {
        return Japanread.sync.getEpisode(Japanread.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (typeof page.url.split('/')[3] !== 'undefined') {
        page.handlePage();
      }
    });
  },
};
