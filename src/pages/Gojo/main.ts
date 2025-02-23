import { pageInterface } from '../pageInterface';

export const Gojo: pageInterface = {
  name: 'Gojo',
  domain: 'https://gojo.wtf',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'watch';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'anime';
  },
  sync: {
    getTitle(url) {
      return j.$('#root > main > div > div.INFO a[href^="/anime/"] > span').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${Gojo.domain}/anime/${Gojo.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return parseInt(
        new URL(url).searchParams.get('ep') ??
          j
            .$('#root > main > div.WATCH > div.Video span:contains(You are Watching)')
            .next()
            .text()
            .split(' ')[1] ??
          '1',
      );
    },
    nextEpUrl(url) {
      const button = j.$(
        '#root > main > div.WATCH > div.Episode > div > button.order-\\[-999999\\]',
      );
      if (button.length) {
        return Gojo.overview?.list?.elementUrl!(button);
      }
      return undefined;
    },
    uiSelector(selector) {
      j.$('#root > main > div > div.INFO div:has(> a[href^="/anime/"])').after(j.html(selector));
    },
    getMalUrl(provider) {
      if (provider === 'ANILIST') {
        return `https://anilist.co/anime/${Gojo.sync.getIdentifier(window.location.href)}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return document.title;
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#root > main div:has(> a[href^="/watch/"])').after(j.html(selector));
    },
    getMalUrl(provider) {
      if (provider === 'ANILIST') {
        return `https://anilist.co/anime/${Gojo.sync.getIdentifier(window.location.href)}`;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$(
          '#root > main > div.WATCH > div.Episode > div > button:not(.order-\\[-999999\\])',
        );
      },
      elementUrl(selector) {
        return `${Gojo.domain}/watch/${Gojo.sync.getIdentifier(window.location.href)}?ep=${Gojo.overview?.list?.elementEp(selector)}`;
      },
      elementEp(selector) {
        return Number(selector.find('span:contains(Ep)').text().split(' ')[1]);
      },
      paginationNext() {
        const select = j.$('#root > main > div.WATCH > div.Episode > div > select');
        if (select.length) {
          const next = select.find(`> option[value="${select.val()}"]`).next();
          if (next.length) {
            next.prop('selected', true);
            select[0].dispatchEvent(
              new Event('change', {
                bubbles: true,
              }),
            );
            return true;
          }
        }
        return false;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    utils.changeDetect(
      () => {
        if (Gojo.overview?.list?.elementsSelector().length) {
          page.handleList();
        }
      },
      () => {
        return Gojo.overview?.list?.elementsSelector().length;
      },
    );

    function waitFn() {
      if (Gojo.isSyncPage(window.location.href)) {
        return Gojo.sync?.getTitle(window.location.href);
      }
      if (Gojo.isOverviewPage!(window.location.href)) {
        return j.$('#root > main a[href^="/watch/"]').length;
      }
      return false;
    }

    let waitTimer: NodeJS.Timer | undefined;
    let watch2getherTimer: number | undefined;

    function check() {
      clearInterval(waitTimer);
      waitTimer = undefined;
      clearInterval(watch2getherTimer);
      watch2getherTimer = undefined;
      page.reset();
      if (Gojo.isSyncPage(window.location.href) || Gojo.isOverviewPage!(window.location.href)) {
        waitTimer = utils.waitUntilTrue(waitFn, function () {
          con.info('Check');
          page.handlePage();
        });
      }
    }

    j.$(document).ready(function () {
      check();
    });
    utils.urlChangeDetect(() => check());
  },
};
