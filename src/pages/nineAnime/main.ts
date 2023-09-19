import { pageInterface } from '../pageInterface';

export const nineAnime: pageInterface = {
  name: 'Aniwave',
  domain: 'https://aniwave.to',
  database: '9anime',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return isWatch2Gether() ? j.$('div.info > div.d-title').text() : j.$('h1.title').text();
    },
    getIdentifier(url) {
      if (isWatch2Gether()) {
        url = nineAnime.sync.getOverviewUrl(url);
      }
      url = utils.urlPart(url, 4);
      if (url.indexOf('.') > -1) {
        url = url.split('.')[1];
      }
      return url;
    },
    getOverviewUrl(url) {
      if (isWatch2Gether()) {
        return utils.absoluteLink(
          j.$('div.info a[href*="/watch/"]').attr('href'),
          nineAnime.domain,
        );
      }
      return utils.absoluteLink(j.$('ul.ep-range > li > a').first().attr('href'), nineAnime.domain);
    },
    getEpisode(url) {
      if (isWatch2Gether()) {
        return parseInt(
          j.$('div.info span.dot.ep .current-episode-name').text().replace(/\D+/g, ''),
        );
      }
      return parseInt(j.$('ul.ep-range > li > a.active').attr('data-num')!);
    },
    nextEpUrl(url) {
      const nextEp = j.$('ul.ep-range > li > a.active').parent('li').next().find('a').attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, nineAnime.domain);
    },
    uiSelector(selector) {
      if (isWatch2Gether()) {
        j.$('div.room-info').after(j.html(selector));
      } else {
        j.$('#w-media').after(j.html(selector));
      }
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // no Ui
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.ep-range > li > a:not([style*="display: none"])');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), nineAnime.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-num'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    nineAnime.domain = `${window.location.protocol}//${window.location.hostname}`;

    if (isWatch2Gether()) {
      if (utils.urlPart(window.location.href, 4) !== 'room') {
        con.error('not watch2gether room page');
        return;
      }

      utils.waitUntilTrue(
        function () {
          return (
            nineAnime.sync.getTitle(window.location.href).length &&
            nineAnime.sync.getEpisode(window.location.href)
          );
        },
        function () {
          con.info('Start check');
          page.handlePage();
          utils.changeDetect(
            () => {
              page.reset();
              page.handlePage();
            },
            () => {
              return (
                nineAnime.sync.getTitle(window.location.href) +
                nineAnime.sync.getEpisode(window.location.href)
              );
            },
          );
        },
      );
    } else {
      utils.waitUntilTrue(
        function () {
          const loaded = j
            .$('ul.ep-range')
            .toArray()
            .some(el => el.style.display !== 'none');

          return loaded && j.$('ul.ep-range li').length;
        },
        function () {
          con.info('Start check');
          page.handlePage();

          utils.urlChangeDetect(function () {
            con.info('Check');
            page.reset();
            page.handlePage();
          });

          utils.changeDetect(
            () => {
              page.handleList();
            },
            () => {
              return j.$('#w-episodes div.dropdown.filter.type > button').text();
            },
          );
        },
      );
    }
  },
};

function isWatch2Gether() {
  return utils.urlPart(window.location.href, 3) === 'watch2gether';
}
