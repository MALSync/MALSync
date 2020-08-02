import { pageInterface } from '../pageInterface';

export const myAnime: pageInterface = {
  name: 'myAnime',
  domain: 'https://myanime.moe',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#episode-details > div > span.current-series > a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return myAnime.domain + (j.$('#episode-details > div > span.current-series > a').attr('href') || '');
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5) || '');
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('div#ep-next')
        .first()
        .parent()
        .attr('href');
      if (!nextEp) return nextEp;
      return myAnime.domain + nextEp;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('span.anime-title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('img.anime-bg')
        .first()
        .after(j.html(selector));
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
        return j.$('ul.list > li.li-block');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          myAnime.domain,
        );
      },
      elementEp(selector) {
        const url = selector
          .find('a')
          .first()
          .attr('href');

        if (!url) return NaN;

        return Number(url.split('/')[3].replace(/\D+/, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
