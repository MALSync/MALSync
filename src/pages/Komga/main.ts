import { pageInterface } from '../pageInterface';

export const Komga: pageInterface = {
  name: 'Komga',
  domain: 'https://demo.komga.org',
  database: 'Komga',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[5] === 'read';
  },
  sync: {
    getTitle(url) {
      return j
        .$('.v-toolbar__title > span:nth-child(1)')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(Komga.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('a.manga-link, a.manga_title')
          .first()
          .attr('href'),
        Komga.domain,
      );
    },
    getEpisode(url) {
      const numberFromPage = j
        .$('title')
        .text()
        .split(' - ')[2]
        .trim();
      return Number(numberFromPage);
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.v-toolbar__title > span:nth-child(1)')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.v-toolbar__title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.my-2');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Komga.domain,
        );
      },
      elementEp(selector) {
        const chapterAsText = selector
          .find('div:nth-child(1) > a:nth-child(2) > div:nth-child(1)')
          .first()
          .text()
          .split(' - ')[1];

        return Number(chapterAsText);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
