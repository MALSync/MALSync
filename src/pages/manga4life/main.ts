import { pageInterface } from '../pageInterface';

export const manga4life: pageInterface = {
  name: 'manga4life',
  domain: 'https://manga4life.com',
  languages: ['English'],
  type: 'manga',
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
      return utils.getBaseText($('div.MainContainer > div.container > div.row > div.Column > a').first()).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(manga4life.sync.getOverviewUrl(url), 4) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('div.MainContainer > div.container > div.row > div.Column > a')
          .first()
          .attr('href'),
        manga4life.domain,
      );
    },
    getEpisode(url) {
      return utils
        .getBaseText($('div.MainContainer > div.container > div.row > div.Column:nth-child(2) > button').first())
        .match(/\d+/gim);
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.BoxBody > div.row > div.top-5 > ul > li:nth-child(1) > h1')
        .first()
        .text();
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
        return selector
          .find('span')
          .first()
          .text()
          .match(/\d+/gim);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(document).ready(function() {
      check();
      checkupdate();
    });

    function check() {
      utils.waitUntilTrue(
        function() {
          if (manga4life.isSyncPage(page.url)) {
            return manga4life.sync.getTitle(page.url) && manga4life.sync.getEpisode(page.url);
          }
          if (manga4life.isOverviewPage!(page.url)) {
            return (
              manga4life.overview!.getTitle(page.url) &&
              !j.$('a[href$="{{vm.ChapterURLEncode(vm.Chapters[vm.Chapters.length-1].Chapter)}}"]').length
            );
          }
          return false;
        },
        function() {
          page.handlePage();
        },
      );
    }
    function checkupdate() {
      if (manga4life.isSyncPage(page.url)) {
        utils.waitUntilTrue(
          function() {
            if (
              j
                .$('div.Column.col-lg-2.col-6 button.btn.btn-sm.btn-outline-secondary.ng-binding')
                .first()
                .text()
                .trim() !== 'undefined'
            ) {
              return true;
            }
            return false;
          },
          function() {
            utils.changeDetect(check, () => {
              return j
                .$('div.Column.col-lg-2.col-6 button.btn.btn-sm.btn-outline-secondary.ng-binding')
                .first()
                .text()
                .trim();
            });
          },
        );
      }
    }
  },
};
