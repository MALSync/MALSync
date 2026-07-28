/* By kaiserdj */
import { pageInterface } from '../pageInterface';

export const Jkanime: pageInterface = {
  name: 'Jkanime',
  domain: 'https://jkanime.net',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (
      !Number.isNaN(parseInt(utils.urlPart(url, 4))) ||
      (utils.urlPart(url, 4) === 'pelicula' && Jkanime.sync.getTitle(url).length)
    ) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    return Jkanime.overview!.getTitle(url).length > 0;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.player_normal > div.row.mb-2 > div.col-md-4.col-12.col-lg-5.langopcs > div > h1')
        .first()
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return `${Jkanime.domain}/${Jkanime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 4)) || 1;
    },
    nextEpUrl(url) {
      return j
        .$('div.ep_bar > div.p-2.anime_slug.text-center > div > a > div:contains("Siguiente")')
        .parent('a')
        .attr('href');
    },
    uiSelector(selector) {
      j.$('#collapseServers').before(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.anime__details__content > div.row > div.col-lg-10 > div.anime_info > h3')
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('div.anime__details__content > div.row > div.col-lg-10 > div.anime_info').after(
        j.html(selector),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.epcontent > div.anime__item a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Jkanime.domain);
      },
      elementEp(selector) {
        return Jkanime.sync.getEpisode(Jkanime.overview!.list!.elementUrl!(selector) || '');
      },
      paginationNext(updateCheck) {
        con.log('updatecheck', updateCheck);
        let el;
        if (updateCheck) {
          el = j.$('div.anime__pagination > a').last();
          if (typeof el[0] === 'undefined' || el.hasClass('pagination-active')) {
            return false;
          }
          el[0].click();
          return true;
        }
        el = j.$('div.anime__pagination > a.pagination-active').next('a');
        if (typeof el[0] === 'undefined') {
          return false;
        }
        el[0].click();
        return true;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      $('div.anime__pagination > a').first().addClass('pagination-active');
      page.handlePage();
    });
    utils.changeDetect(
      () => {
        page.handleList();
      },
      () => {
        return j.$('div.epcontent > div.anime__item a').last().attr('href');
      },
    );
    $('div.anime__pagination > a').click(function () {
      $('div.anime__pagination > a').removeClass('pagination-active');
      $(this).addClass('pagination-active');
    });
  },
};
