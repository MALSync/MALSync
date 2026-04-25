import { pageInterface } from '../pageInterface';

export const manga4life: pageInterface = {
  name: 'manga4life',
  domain: 'https://manga4life.com',
  languages: ['English'],
  type: 'manga',
  database: 'MangaSee',
  isSyncPage(url) {
    if (url.split('/')[3] === 'read-online') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'manga') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils
        .getBaseText($('div.MainContainer > div.container > div.row > div.Column > a').first())
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(manga4life.sync.getOverviewUrl(url), 4) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('div.MainContainer > div.container > div.row > div.Column > a').first().attr('href'),
        manga4life.domain,
      );
    },
    getEpisode(url) {
      return parseInt(
        utils
          .getBaseText(
            $(
              'div.MainContainer > div.container > div.row > div.Column:nth-child(2) > button',
            ).first(),
          )
          .match(/\d+/gim)![0],
      );
    },
    readerConfig: [
      {
        condition: '.fa-columns',
        current: {
          selector: '.ImageGallery > .ng-scope',
          mode: 'countAbove',
        },
        total: {
          selector: '.ImageGallery > .ng-scope',
          mode: 'count',
        },
      },
      {
        condition: '.fa-arrows-alt-v',
        current: {
          selector: '[data-target="#PageModal"]',
          mode: 'text',
          regex: '\\d+$',
        },
        total: {
          selector: '.ImageGallery > .ng-scope',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('div.BoxBody > div.row > div.top-5 > ul > li:nth-child(1) > h1').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('div.BoxBody > div.row > div.top-5 > ul > li:nth-child(1) > h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        j.$('div.BoxBody > div.list-group > div.list-group-item.ShowAllChapters').click();
        return j.$('div.BoxBody > div.list-group > a.list-group-item.ChapterLink');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), manga4life.domain);
      },
      elementEp(selector) {
        return Number(selector.find('span').first().text().match(/\d+/gim));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(function () {
      utils.waitUntilTrue(
        function () {
          if (manga4life.isSyncPage(page.url)) {
            return manga4life.sync.getTitle(page.url) && manga4life.sync.getEpisode(page.url);
          }
          if (manga4life.isOverviewPage!(page.url)) {
            return (
              manga4life.overview!.getTitle(page.url) &&
              !j.$('a[href$="{{vm.ChapterURLEncode(vm.Chapters[vm.Chapters.length-1].Chapter)}}"]')
                .length
            );
          }
          return false;
        },
        function () {
          if (manga4life.isOverviewPage!(page.url)) {
            page.handlePage();
          }
          if (manga4life.isSyncPage(page.url)) {
            changeDetectBlank(
              () => {
                page.handlePage();
              },
              () => {
                return j
                  .$('div.Column.col-lg-2.col-6 button.btn.btn-sm.btn-outline-secondary.ng-binding')
                  .first()
                  .text()
                  .trim();
              },
            );
          }
        },
      );
    });

    function changeDetectBlank(callback, func) {
      let currentPage = '';
      const intervalId = setInterval(function () {
        const temp = func();
        if (typeof temp !== 'undefined' && currentPage !== temp) {
          currentPage = func();
          callback();
        }
      }, 500);

      return Number(intervalId);
    }
  },
};
