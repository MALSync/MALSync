import { pageInterface } from '../pageInterface';

export const Japanread: pageInterface = {
  name: 'Japanread',
  domain: 'https://www.japanread.cc/',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return typeof url.split('/')[5] !== 'undefined' && url.split('/')[5].length > 0;
  },
  sync: {
    getTitle() {
      return j
        .$('.reader-controls-title > div > a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url.substr(0, url.lastIndexOf('/'));
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    getVolume() {
      const currentChapter = j.$('#jump-chapter option:selected');
      if (currentChapter.length) {
        let temp = currentChapter
          .text()
          .trim()
          .match(/(vol\.|volume)\D?\d+/i);
        if (temp !== null) {
          temp = temp[0].match(/\d+/);
          if (temp !== null) {
            return parseInt(temp[0]);
          }
        }
      }
      return 0;
    },
    nextEpUrl(url) {
      const nextChapter = j.$('#jump-chapter option:selected').prev();

      if (nextChapter && typeof nextChapter !== 'undefined') {
        let temp = nextChapter
          .text()
          .trim()
          .match(/(ch\.|chapitre)\D?\d+/i);
        if (temp !== null) {
          temp = temp[0].replace('.', '-').match(/\d+/);
          if (temp !== null) {
            return utils.absoluteLink(temp[0], Japanread.sync.getOverviewUrl(url));
          }
        }
      }
      return '';
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
      j.$('.card.card-manga .card-body .row.edit .col-md-7')
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
        return j.$('[data-row=chapter]');
      },
      elementUrl(selector) {
        if (j.$('#navbar-guest').length === 0) {
          return utils.absoluteLink(
            selector
              .find('a')
              .eq(1)
              .attr('href'),
            Japanread.domain,
          );
        }
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
      if (page.url.split('/')[3] === 'manga' && typeof page.url.split('/')[4] !== 'undefined') {
        con.info('Waiting');
        utils.waitUntilTrue(
          () => {
            return j.$('#jump-chapter option:selected').text() !== '' || j.$('[data-row=chapter]').length;
          },
          () => {
            con.info('Start');
            page.handlePage();
          },
        );
      }
    });
  },
};
