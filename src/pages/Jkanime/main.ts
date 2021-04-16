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
        .$('div.breadcrumb-option > div > div > div> div.breadcrumb__links > h1')
        .first()
        .text()
        .split(' - ')[0];
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
        .$('div:contains("Proximo Episodio")')
        .parent('a')
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.anime__details__title > h3').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('section.contenido.spad > div > div.row').before(j.html(selector));
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
        return Jkanime.sync.getEpisode(Jkanime.overview?.list?.elementUrl(selector) || '');
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
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      $('div.anime__pagination > a')
        .first()
        .addClass('pagination-active');
      page.handlePage();
    });
    utils.changeDetect(
      () => {
        page.handleList();
      },
      () => {
        return j
          .$('div.epcontent > div.anime__item a')
          .first()
          .attr('href');
      },
    );
    $('div.anime__pagination > a').click(function() {
      $('div.anime__pagination > a').removeClass('pagination-active');
      $(this).addClass('pagination-active');
    });
  },
};
