import { pageInterface } from '../pageInterface';

export const Bentomanga: pageInterface = {
  name: 'Bentomanga',
  domain: 'https://bentomanga.com',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return typeof url.split('/')[5] !== 'undefined' && url.split('/')[5].length > 0;
  },
  sync: {
    getTitle() {
      return j.$('.reader-controls-title > div > a').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(
        j.$('.reader-controls-title > div > a').attr('href'),
        Bentomanga.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 6));
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
  },
  overview: {
    getTitle() {
      return j.$('.component-manga-title_main > h1').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.datas').after(
        j.html(
          `<div class="datas"><h3 class="datas_header">MAL-Sync</h3><div>${selector}</div></div>`,
        ),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[data-chapter]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a.text-truncate').attr('href'), Bentomanga.domain);
      },
      elementEp(selector) {
        return Bentomanga.sync.getEpisode(Bentomanga.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (page.url.split('/')[3] === 'manga' && typeof page.url.split('/')[4] !== 'undefined') {
        con.info('Waiting');
        utils.waitUntilTrue(
          () => {
            return (
              j.$('#jump-chapter option:selected').text() !== '' || j.$('.div-chapters').length
            );
          },
          () => {
            con.info('Start');
            page.handlePage();
          },
        );
      }
    });
    utils.changeDetect(
      () => {
        page.handleList();
      },
      () => {
        return j.$('[data-chapter]').first().text();
      },
    );
  },
};
