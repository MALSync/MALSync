import { pageInterface } from '../pageInterface';

export const MangasOrigines: pageInterface = {
  name: 'MangasOrigines',
  domain: 'https://mangas-origines.fr/',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return $('div.wp-manga-nav').length > 0;
  },
  sync: {
    getTitle() {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[2]).text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return j.$(j.$('div.c-breadcrumb-wrapper ol.breadcrumb li a')[2]).attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);

      const temp = episodePart.match(/chapitre-\d+/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl() {
      return j
        .$("select.single-chapter-select > option:contains('Chapitre')")
        .first()
        .parent()
        .find(':selected')
        .prev()
        .attr('data-redirect');
    },
  },
  overview: {
    getTitle() {
      return j.$('ol.breadcrumb li a').last().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.tab-summary').after(
        j.html(`<div class="malsync"> <h4> MAL-Sync </h4> ${selector}</div>`),
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
        return MangasOrigines.sync.getEpisode(MangasOrigines.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(() => {
      if (page.url.split('/')[3] === 'manga') {
        utils.waitUntilTrue(
          () => {
            return j.$('ul.version-chap').length || j.$('select.single-chapter-select').length;
          },
          () => {
            page.handlePage();
          },
        );
      }
    });
  },
};
