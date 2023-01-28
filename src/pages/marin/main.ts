import { pageInterface } from '../pageInterface';

export const marin: pageInterface = {
  name: 'marin',
  domain: 'https://marin.moe',
  languages: ['English'],
  type: 'anime',
  database: 'Marin',
  isSyncPage(url) {
    return url.split('/').length === 6 && url.split('/')[3] === 'anime';
  },
  isOverviewPage(url) {
    return url.split('/').length === 5 && url.split('/')[3] === 'anime';
  },
  sync: {
    getTitle(url) {
      return j.$('h1 > a[href*="/anime/"]').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('h1 > a[href*="/anime/"]').attr('href'), marin.domain);
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('a[title="Next Episode"]').not('.invisible').attr('href'),
        marin.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div > h1.text-xl').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#tab-menus').first().parent().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$(`ul > li > a[href*="${marin.sync.getIdentifier(window.location.href)}/"]`);
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), marin.domain);
      },
      elementEp(selector) {
        return marin.sync.getEpisode(marin.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let interval;
    let listUpdate;
    utils.fullUrlChangeDetect(function () {
      page.reset();

      clearInterval(interval);
      clearInterval(listUpdate);
      interval = utils.waitUntilTrue(
        () => !j.$('html.nprogress-busy').length,
        () => {
          if (marin.isOverviewPage!(window.location.href)) {
            listUpdate = utils.changeDetect(
              () => page.handleList(),
              () =>
                ($(`ul > li > a[href*="${marin.sync.getIdentifier(window.location.href)}/"]`)
                  .first()
                  .attr('href') || '') +
                ($(`ul > li > a[href*="${marin.sync.getIdentifier(window.location.href)}/"]`)
                  .last()
                  .attr('href') || ''),
            );
          }

          page.handlePage();
        },
      );
    });
  },
};
