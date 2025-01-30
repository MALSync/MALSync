import { pageInterface } from '../pageInterface';

export const AnimeKAI: pageInterface = {
  name: 'AnimeKAI',
  domain: 'https://animekai.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('#main-entity div.title[data-jp]').data('jp');
    },
    getIdentifier(url) {
      if (isWatch2Gether()) {
        url = AnimeKAI.sync.getOverviewUrl(url);
      }
      return utils.urlPart(url, 4).match(/\w+$/)![0];
    },
    getOverviewUrl(url) {
      if (isWatch2Gether()) {
        return utils.absoluteLink(j.$('#main-entity a.btn-primary').attr('href'), AnimeKAI.domain);
      }
      return utils.absoluteLink(j.$('link[rel=canonical]').attr('href'), AnimeKAI.domain);
    },
    getEpisode(url) {
      return parseInt(j.$('div.eplist a.active').attr('num') ?? '0');
    },
    nextEpUrl(url) {
      const nextEp = j.$(`div.eplist a[num=${AnimeKAI.sync.getEpisode(url) + 1}]`).attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, AnimeKAI.domain);
    },
    uiSelector(selector) {
      j.$('#main-entity div.info').after(j.html(selector));
    },
    getMalUrl(provider) {
      if (isWatch2Gether()) {
        return false;
      }
      const watchPage = j.$('watch-page');
      const malId = watchPage.data('mal-id');
      if (malId) {
        return `https://myanimelist.net/anime/${malId}`;
      }
      const alId = watchPage.data('al-id');
      if (provider === 'ANILIST') {
        return `https://anilist.co/anime/${alId}`;
      }
      return false;
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
        return j.$('div.eplist a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeKAI.domain);
      },
      elementEp(selector) {
        return Number(selector.data('num'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    AnimeKAI.domain = `${window.location.protocol}//${window.location.hostname}`;

    if (isWatch2Gether()) {
      if (utils.urlPart(window.location.href, 4) !== 'rooms') {
        con.error('not watch2gether room page');
        return;
      }

      utils.waitUntilTrue(
        function () {
          return (
            AnimeKAI.sync.getTitle(window.location.href).length &&
            AnimeKAI.sync.getEpisode(window.location.href)
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
                AnimeKAI.sync.getTitle(window.location.href) +
                AnimeKAI.sync.getEpisode(window.location.href)
              );
            },
          );
        },
      );
    } else {
      utils.waitUntilTrue(
        function () {
          const loaded = j
            .$('div.eplist')
            .toArray()
            .some(el => el.style.display !== 'none');

          return loaded && j.$('div.eplist').length;
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
