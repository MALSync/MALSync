import { pageInterface } from '../pageInterface';

const excluded = ['imgur'];

export const Cubari: pageInterface = {
  name: 'Cubari',
  domain: ['https://cubari.moe'],
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (
      url.split('/')[3] === 'read' &&
      !excluded.includes(url.split('/')[4]) &&
      url.split('/').length >= 8
    ) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (
      url.split('/')[3] === 'read' &&
      !excluded.includes(url.split('/')[4]) &&
      url.split('/').length >= 6
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#rdr-main > aside > header > h1 > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('#rdr-main > aside > header > h1 > a').attr('href'),
        Cubari.domain,
      );
    },
    getEpisode(url) {
      let temp = j
        .$(
          '#rdr-main > aside > div.rdr-aside-content > section.rdr-selector > div.rdr-selector-mid > div.rdr-chap-wrap.UI.FauxDrop > label',
        )
        .text();
      temp = temp.substring(temp.indexOf('-') + 2).split('.')[0];
      if (!temp || !temp.length) return 0;
      return Number(temp.replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.series-content > article > h1, article content > h1').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('div.series-content > article').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j
          .$('div#detailedView, div#compactView, tbody#chapterTable')
          .not('.d-none')
          .first()
          .find(`a[href*="/read/${utils.urlPart(window.location.href, 4)}"]`);
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href') || '', Cubari.domain);
      },
      elementEp(selector) {
        return Cubari.sync.getEpisode(Cubari.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    let interval;

    let urlWithoutPage = '';

    utils.fullUrlChangeDetect(function () {
      page.reset();
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function () {
          if (
            Cubari.overview!.getTitle(window.location.href).length ||
            Cubari.sync.getTitle(window.location.href).length
          ) {
            return true;
          }
          return false;
        },
        function () {
          if (window.location.href.split('/').slice(0, 7).join('/') !== urlWithoutPage) {
            urlWithoutPage = window.location.href.split('/').slice(0, 7).join('/');

            switch (window.location.href.split('/')[4]) {
              case 'mangadex':
                Cubari.database = 'Mangadex';
                break;
              case 'mangasee':
                Cubari.database = 'MangaSee';
                break;
              default:
                Cubari.database = undefined;
                break;
            }
            page.handlePage();
          }
        },
      );
    });

    j.$(document).on('click', 'div.series-content > div.btn-group', () => {
      page.handleList();
    });
  },
};
