import { pageInterface } from '../../pages/pageInterface';

export const HentaiKisa: pageInterface = {
  name: 'HentaiKisa',
  domain: 'https://hentaikisa.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== null && j.$('div.c a.infoan2')[0] && j.$('#playerselector option:selected')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.c a.infoan2')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return j.$('div.c a.infoan2').attr('href') || '';
    },
    getOverviewUrl(url) {
      return `${HentaiKisa.domain}/${j.$('div.c a.infoan2').attr('href')}`;
    },
    getEpisode(url) {
      const episodeText = j.$('#playerselector option:selected').text();

      if (!episodeText) return NaN;

      return Number(episodeText.replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const num = $('#playerselector')
        .find('option:selected')
        .next()
        .attr('value');

      if (!num) return '';

      const href = url.replace(/\d+$/, num);
      if (typeof num !== 'undefined' && href !== url) {
        return utils.absoluteLink(href, HentaiKisa.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#body > div.main-container > div > div.notmain > div > div.infobox > div.infoboxc > div > h1')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[3];
    },
    uiSelector(selector) {
      j.$('#body > div.main-container > div > div.notmain > div > div.infobox > div.iepbox.nobackground')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] !== null && j.$('div.c a.infoan2')[0] && j.$('#playerselector option:selected')[0]) ||
        (page.url.split('/')[3] !== null &&
          j.$('#body > div.main-container > div > div.notmain > div > div.infobox > div.infoboxc > div > h1')[0] &&
          j.$('#body > div.main-container > div > div.notmain > div > div.infobox > div.iepbox.nobackground')[0])
      ) {
        page.handlePage();
      }
    });
  },
};
