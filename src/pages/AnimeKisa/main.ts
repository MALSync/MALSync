import { pageInterface } from '../pageInterface';

export const AnimeKisa: pageInterface = {
  name: 'AnimeKisa',
  domain: 'https://animekisa.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== null && j.$('div.c a.infoan2')[0] && j.$('#playerselector option:selected')[0]) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    const infoElement = j.$('div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1');
    const episodeList = j.$('div.notmain > div > div.infobox > div.infoepboxmain');

    if (!url.split('/')[3] || infoElement.length === 0 || episodeList.length === 0) return false;

    return true;
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
      return `${AnimeKisa.domain}/${j.$('div.c a.infoan2').attr('href')}`;
    },
    getEpisode(url) {
      return Number(
        j
          .$('#playerselector option:selected')
          .text()
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl(url) {
      const num = $('#playerselector')
        .find('option:selected')
        .next()
        .attr('value');

      if (!num) return '';

      const href = url.replace(/\d+$/, num);

      if (typeof num !== 'undefined' && href !== url) {
        return utils.absoluteLink(href, AnimeKisa.domain);
      }
      return '';
    },
    getMalUrl(provider) {
      return AnimeKisa.overview!.getMalUrl!(provider);
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
      return url.split('/')[3];
    },
    uiSelector(selector) {
      j.$('.infoepboxmain')
        .first()
        .before(j.html(selector));
    },
    getMalUrl(provider) {
      let url = j
        .$('a[href^="https://myanimelist.net/anime/"]')
        .not('#malRating')
        .first()
        .attr('href');
      if (url) return url;
      if (provider === 'ANILIST') {
        url = j
          .$('a[href^="https://anilist.co/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      if (provider === 'KITSU') {
        url = j
          .$('a[href^="https://kitsu.io/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.infoepbox > a');
      },
      elementUrl(selector) {
        return `${AnimeKisa.domain}/${selector
          .find('.infoepmain')
          .first()
          .parent()
          .attr('href')}`;
      },
      elementEp(selector) {
        return Number(
          selector
            .find('div.infoept2r > div, div.infoept2 > div')
            .first()
            .text(),
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
