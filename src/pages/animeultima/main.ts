import { pageInterface } from '../pageInterface';

export const animeultima: pageInterface = {
  name: 'animeultima',
  domain: 'https://animeultima.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'a' && j.$('h1.title.is-marginless span.is-size-4.is-size-5-touch.is-size-6-mobile')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1.title.is-marginless span.is-size-4.is-size-5-touch.is-size-6-mobile')
        .text()
        .replace(/\n.*/g, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).replace(/_\d+$/, '');
    },
    getOverviewUrl(url) {
      return `${animeultima.domain}/a/${animeultima.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number(
        j
          .$('h1.title.is-marginless span.is-size-4.is-size-5-touch.is-size-6-mobile')
          .text()
          .replace(/.*\n/g, '')
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl(url) {
      const href = j
        .$('.level-right a')
        .first()
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, animeultima.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return utils
        .getBaseText($('h1.title.is-marginless.is-paddingless').first())
        .replace(/[^ \w]+/g, '')
        .trim();
    },
    getIdentifier(url) {
      return animeultima.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div.tags.is-marginless')
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      const url = j
        .$('a[href^="https://myanimelist.net/anime/"]')
        .not('#malRating')
        .first()
        .attr('href');
      if (url) return url;
      return false;
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
