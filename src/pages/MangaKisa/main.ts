import { pageInterface } from '../pageInterface';

export const MangaKisa: pageInterface = {
  name: 'MangaKisa',
  domain: 'https://mangakisa.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] !== undefined && j.$('div.now2 > a.infoan2').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (!url.split('/')[3] || j.$('div.infoboxc > div.infodesbox > h1.infodes').length === 0) return false;

    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.now2 > a.infoan2')
        .text()
        .trim();
    },
    getIdentifier(url) {
      const anchorHref = j.$('div.now2 > a.infoan2').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[1];
    },
    getOverviewUrl(url) {
      return MangaKisa.domain + (j.$('div.now2 > a.infoan2').attr('href') || '');
    },
    getEpisode(url) {
      const episodePart = j.$('#chaptertext option:selected').text();

      if (!episodePart) return NaN;

      const matches = episodePart.match(/(?:chapter |Ch.)+\d+/gi);

      if (!matches || matches.length === 0) return NaN;

      return Number(matches[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const num = $('#chaptertext')
        .find('option:selected')
        .next()
        .attr('value');

      if (!num) return '';

      const href = url.replace(/\d+$/, num);

      if (typeof num !== 'undefined' && href !== url) {
        return utils.absoluteLink(href, MangaKisa.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('.infoepboxmain')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.infoepbox > a');
      },
      elementUrl(selector) {
        return `${MangaKisa.domain}/${selector
          .find('.infoepmain')
          .first()
          .parent()
          .attr('href')}`;
      },
      elementEp(selector) {
        return Number(
          selector
            .find('div.infoept1 > div')
            .first()
            .text()
            .match(/(?:chapter |Ch.)+\d+/gi)?.[0]
            .replace(/\D+/g, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
