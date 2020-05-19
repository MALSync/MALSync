import { pageInterface } from './../pageInterface';

export const MangaPlus: pageInterface = {
  name: 'MangaPlus',
  domain: 'https://mangaplus.shueisha.co.jp',
  type: 'manga',
  isSyncPage: function(url) {
    if (url.split('/')[3] == 'viewer') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('h1.Navigation-module_title_180OT')
        .first()
        .text();
    },
    getIdentifier: function(url) {
      const identifierHref = j
        .$('h1.Navigation-module_title_180OT')
        .first()
        .parent()
        .attr('href');

      if (!identifierHref || identifierHref.length < 3) return '';

      return identifierHref.split('/')[2];
    },
    getOverviewUrl: function(url) {
      return (
        MangaPlus.domain +
        (j
          .$('h1.Navigation-module_title_180OT')
          .first()
          .parent()
          .attr('href') || '')
      );
    },
    getEpisode: function(url) {
      const episodeText = j
        .$('p.Navigation-module_chapterTitle_20juD')
        .first()
        .text();

      if (!episodeText) return NaN;

      return Number(episodeText.replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('h1.TitleDetailHeader-module_title_Iy33M')
        .first()
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector) {
      selector.insertBefore(
        j.$('div.TitleDetail-module_flexContainer_1oGb4').first(),
      );
    },
  },
  init(page) {
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    if (
      page.url.split('/')[3] === 'viewer' ||
      page.url.split('/')[3] === 'titles'
    ) {
      utils.waitUntilTrue(
        function() {
          if (
            j.$('h1.Navigation-module_title_180OT').text() ||
            j.$('h1.TitleDetailHeader-module_title_Iy33M').text()
          ) {
            return true;
          } else {
            return false;
          }
        },
        function() {
          page.handlePage();
        },
      );
    }
    utils.urlChangeDetect(function() {
      page.url = window.location.href;
      page.UILoaded = false;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
      if (
        page.url.split('/')[3] === 'viewer' ||
        page.url.split('/')[3] === 'titles'
      ) {
        utils.waitUntilTrue(
          function() {
            if (
              j.$('h1.Navigation-module_title_180OT').text() ||
              j.$('h1.TitleDetailHeader-module_title_Iy33M').text()
            ) {
              return true;
            } else {
              return false;
            }
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
