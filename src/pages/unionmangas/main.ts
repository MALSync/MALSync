import { pageInterface } from '../pageInterface';

export const unionmangas: pageInterface = {
  name: 'unionmangas',
  domain: ['https://unionleitor.top', 'https://unionmangas.top'],
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'leitor' && url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('body > div.breadcrumbs > div > div > a:nth-child(3)')).trim();
    },
    getIdentifier(url) {
      const identifierAnchorHref = j.$('body > div.breadcrumbs > div > div > a:nth-child(3)').attr('href');

      if (!identifierAnchorHref) return '';

      return identifierAnchorHref.split('/')[4].toLowerCase();
    },
    getOverviewUrl(url) {
      return j.$('body > div.breadcrumbs > div > div > a:nth-child(3)').attr('href') || '';
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      const newUrl = url.split(/[?#]/)[0];
      const num = $('#capitulo_trocar')
        .find('option:selected')
        .next()
        .attr('value');

      if (!num) return '';

      const href = newUrl.replace(/\d+$/, num);

      if (typeof num !== 'undefined' && href !== newUrl) {
        return utils.absoluteLink(href, unionmangas.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.row > div.col-md-12 > h2')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      const urlPart4 = utils.urlPart(url, 4);

      if (!urlPart4) return '';

      return urlPart4.toLowerCase();
    },
    uiSelector(selector) {
      j.$('div.row > div.col-md-12 > h2')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.row.lancamento-linha');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div > a')
            .first()
            .attr('href'),
          unionmangas.domain,
        );
      },
      elementEp(selector) {
        return utils
          .absoluteLink(
            selector
              .find('div > a')
              .first()
              .attr('href'),
            unionmangas.domain,
          )
          .split('/')[5];
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'leitor' ||
        page.url.split('/')[3] === 'perfil-manga' ||
        page.url.split('/')[3] === 'manga'
      ) {
        page.handlePage();
      }
    });
  },
};
