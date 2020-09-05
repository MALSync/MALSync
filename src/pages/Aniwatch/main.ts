import { pageInterface } from '../pageInterface';

let tabPage;

export const Aniwatch: pageInterface = {
  name: 'Aniwatch',
  domain: 'https://aniwatch.me',
  database: 'Aniwatch',
  languages: ['English', 'German'],
  type: 'anime',
  isSyncPage(url) {
    if (tabPage === 'stream' || tabPage === 'w2g') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (tabPage === 'stream') {
        return j.$('h1.md-headline.no-margin > span.border-right.pr-5').text();
      }
      return j.$('h2.md-title > span.border-right > a').text();
    },
    getIdentifier(url) {
      if (tabPage === 'stream') {
        return url.split('/')[4];
      }

      const anchorHref = j.$('h2.md-title > span.border-right > a').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[2];
    },
    getOverviewUrl(url) {
      return `${Aniwatch.domain}/anime/${Aniwatch.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      if (tabPage === 'stream') {
        return parseInt(utils.urlPart(url, 5));
      }
      return Number(
        j
          .$('h2.md-title > span.desc-color')
          .text()
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl(url) {
      if (tabPage !== 'stream' || j.$('#anilyr-nextEpi').is('[disabled=disabled]')) return '';

      const urlPart5 = utils.urlPart(url, 5);

      if (!urlPart5) return '';

      return url.replace(/\d+$/, String(parseInt(urlPart5) + 1));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('md-content > div > div.responsive-anime.anime-boxes-margin > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#enable-ani-cm > div > section.section-padding > div > md-content > div > div > md-content > div')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

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
      }
      return `${window.location.href}/${j.$('.md-tab.md-active').text()}`;
    });
    loaded();
    $(document).on('keydown', function(e) {
      if ((e.which || e.keyCode) === 116) {
        loaded();
      }
    });
    function loaded() {
      page.reset();
      if (page.url.split('/')[3] === 'anime') {
        tabPage = j
          .$('.md-tab.md-active')
          .text()
          .toLowerCase();
        if (typeof tabPage !== 'undefined' && (tabPage === 'stream' || tabPage === 'overview')) {
          utils.waitUntilTrue(
            function() {
              if (
                j.$('md-content > div > div.responsive-anime.anime-boxes-margin > h1').text().length ||
                j.$('h1.md-headline.no-margin > span.border-right.pr-5').text().length
              ) {
                return true;
              }
              return false;
            },
            function() {
              console.log('pagehandle');
              page.handlePage();
            },
          );
        }
      } else if (
        page.url.split('/')[3] === 'watch2gether' &&
        j.$('h2.md-title > span.border-right > a').text() &&
        j.$('h2.md-title > span.desc-color').text()
      ) {
        tabPage = 'w2g';
        page.handlePage();
      }
    }
  },
};
