import { pageInterface } from '../pageInterface';

export const AnimeKAI: pageInterface = {
  name: 'AnimeKAI',
  domain: 'https://animekai.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return isWatch() || isWatch2Gether();
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
      return parseInt(j.$('div.eplist a.active').attr('num') ?? j.$('#cur-ep-num')?.text() ?? '0');
    },
    nextEpUrl(url) {
      const current = j.$('div.eplist a.active').parent();
      const nextEp = current.next().find('a').attr('href');
      if (nextEp) {
        return nextEp;
      }
      return current.closest('ul.range').next().find('li:first-child a').attr('href');
    },
    uiSelector(selector) {
      j.$('#main-entity div.info').after(j.html(selector));
    },
    getMalUrl(provider) {
      const watchPage = j.$('#watch-page');
      if (watchPage.length) {
        const malId = watchPage.data('mal-id');
        if (malId) {
          return `https://myanimelist.net/anime/${malId}`;
        }
        const alId = watchPage.data('al-id');
        if (alId && provider === 'ANILIST') {
          return `https://anilist.co/anime/${alId}`;
        }
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
        return Number(selector.attr('num'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    utils.changeDetect(
      () => {
        if (AnimeKAI.overview?.list?.elementsSelector().length) {
          page.handleList();
        }
      },
      () => {
        return AnimeKAI.overview?.list?.elementsSelector().length;
      },
    );

    function waitFn() {
      if (isWatch()) {
        const loaded = j
          .$('div.eplist')
          .toArray()
          .some(el => el.style.display !== 'none');

        return loaded && j.$('div.eplist').length > 0 && window.location.hash.length > 0;
      }
      if (isWatch2Gether()) {
        return (
          AnimeKAI.sync.getTitle(window.location.href).length > 0 &&
          AnimeKAI.sync.getEpisode(window.location.href) > 0
        );
      }
      return false;
    }

    function handlePage() {
      con.info('Check');
      page.handlePage();
    }

    j.$(document).ready(function () {
      let waitTimer: NodeJS.Timer | undefined;

      utils.changeDetect(
        () => {
          clearInterval(waitTimer);
          waitTimer = undefined;
          page.reset();
          if (isWatch() || isWatch2Gether()) {
            waitTimer = utils.waitUntilTrue(waitFn, handlePage);
          }
        },
        () => {
          return AnimeKAI.isSyncPage(window.location.href)
            ? [
                AnimeKAI.sync.getIdentifier(window.location.href),
                AnimeKAI.sync.getEpisode(window.location.href),
              ].join('-')
            : '';
        },
        true,
      );
    });
  },
};

function isWatch() {
  return utils.urlPart(window.location.href, 3) === 'watch';
}

function isWatch2Gether() {
  return (
    utils.urlPart(window.location.href, 3) === 'watch2gether' &&
    utils.urlPart(window.location.href, 4) === 'rooms'
  );
}
