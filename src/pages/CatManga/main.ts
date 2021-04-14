import { pageInterface } from '../pageInterface';

export const CatManga: pageInterface = {
  name: 'CatManga',
  domain: 'https://catmanga.org',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'series' && typeof url.split('/')[5] !== 'undefined' && url.split('/')[5].length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'series' && typeof url.split('/')[4] !== 'undefined' && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('span[class^="readerNavigation_seriesTitle"]').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('a[class^="readerNavigation_title"]').attr('href') || '', CatManga.domain);
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5)) || 1;
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('a[class*="readerNavigation_chapter"][class*="chaptertile_selected"]')
        .prev('a')
        .attr('href');

      if (nextEp && nextEp.length) {
        return utils.absoluteLink(nextEp, CatManga.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1[class^="series_seriesTitle"]').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('[class^="series_grid"]')
        .first()
        .prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('a[class^="chaptertile_element"]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href') || '', CatManga.domain);
      },
      elementEp(selector) {
        return CatManga.sync.getEpisode(CatManga.overview?.list?.elementUrl(selector) || '');
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let Interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    }, true);

    function check() {
      clearInterval(Interval);
      Interval = utils.waitUntilTrue(
        function() {
          if (
            CatManga.overview!.getTitle(window.location.href).length ||
            CatManga.sync!.getTitle(window.location.href).length
          ) {
            return true;
          }
          return false;
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};
