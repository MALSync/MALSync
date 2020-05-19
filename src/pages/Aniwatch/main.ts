import { pageInterface } from './../pageInterface';

let tabPage;

export const Aniwatch: pageInterface = {
  name: 'Aniwatch',
  domain: 'https://aniwatch.me',
  database: 'Aniwatch',
  type: 'anime',
  isSyncPage: function(url) {
    if (tabPage === 'stream' || tabPage === 'w2g') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      if (tabPage === 'stream') {
        return j.$('h1.md-headline.no-margin > span.border-right.pr-5').text();
      } else {
        return j.$('h2.md-title > span.border-right > a').text();
      }
    },
    getIdentifier: function(url) {
      if (tabPage === 'stream') {
        return url.split('/')[4];
      }

      const anchorHref = j
        .$('h2.md-title > span.border-right > a')
        .attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[2];
    },
    getOverviewUrl: function(url) {
      return `${Aniwatch.domain}/anime/${Aniwatch.sync.getIdentifier(url)}`;
    },
    getEpisode: function(url) {
      if (tabPage === 'stream') {
        return parseInt(utils.urlPart(url, 5));
      } else {
        return Number(
          j
            .$('h2.md-title > span.desc-color')
            .text()
            .replace(/\D+/g, ''),
        );
      }
    },
    nextEpUrl: function(url) {
      if (
        tabPage !== 'stream' ||
        !j.$('#anilyr-nextEpi').is('[disabled=disabled]')
      )
        return;

      const urlPart5 = utils.urlPart(url, 5);

      if (!urlPart5) return;

      return url.replace(/\d+$/, String(parseInt(urlPart5) + 1));
    },
  },
  overview: {
    getTitle: function(url) {
      return j
        .$('md-content > div > div.responsive-anime.anime-boxes-margin > h1')
        .text();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector) {
      selector.insertBefore(
        j
          .$(
            '#enable-ani-cm > div > section.section-padding > div > md-content > div > div > md-content > div',
          )
          .first(),
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

    utils.changeDetect(loaded, () => {
      if (window.location.href.split('/')[3] === 'watch2gether') {
        return (
          window.location.href +
          j.$('h2.md-title > span.border-right > a').text() +
          j
            .$('h2.md-title > span.desc-color')
            .text()
            .replace(/\D+/g, '')
        );
      } else {
        return `${window.location.href}/${j.$('.md-tab.md-active').text()}`;
      }
    });
    loaded();
    $(document).on('keydown', function(e) {
      if ((e.which || e.keyCode) == 116) {
        loaded();
      }
    });
    function loaded() {
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
      page.url = window.location.href;
      page.UILoaded = false;
      if (page.url.split('/')[3] === 'anime') {
        tabPage = j
          .$('.md-tab.md-active')
          .text()
          .toLowerCase();
        if (
          typeof tabPage !== 'undefined' &&
          (tabPage === 'stream' || tabPage === 'overview')
        ) {
          utils.waitUntilTrue(
            function() {
              if (
                j
                  .$(
                    'md-content > div > div.responsive-anime.anime-boxes-margin > h1',
                  )
                  .text().length ||
                j.$('h1.md-headline.no-margin > span.border-right.pr-5').text()
                  .length
              ) {
                return true;
              } else {
                return false;
              }
            },
            function() {
              console.log('pagehandle');
              page.handlePage();
            },
          );
        }
      } else {
        if (
          page.url.split('/')[3] === 'watch2gether' &&
          j.$('h2.md-title > span.border-right > a').text() &&
          j.$('h2.md-title > span.desc-color').text()
        ) {
          tabPage = 'w2g';
          page.handlePage();
        }
      }
    }
  },
};
