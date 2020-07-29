import { pageInterface } from '../pageInterface';

export const Scantrad: pageInterface = {
  name: 'Scantrad',
  domain: 'https://scantrad.net',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'mangas';
  },
  sync: {
    getTitle(url) {
      return j
        .$('.tl-titre')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('.tl-titre')
          .first()
          .attr('href'),
        Scantrad.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      const href = j.$('a.next_chapitre').attr('href');
      if (href && !href.endsWith('end')) return utils.absoluteLink(href, Scantrad.domain);
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.titre')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('.info').append(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'mangas' && typeof page.url.split('/')[4] !== 'undefined') ||
        (j.$('body > div.main-fiche > div.mf-info > div.titre').length && j.$('#chap-top').length)
      ) {
        page.handlePage();
      }
    });
  },
};
