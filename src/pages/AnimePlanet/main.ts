import { pageInterface } from '../pageInterface';

export const AnimePlanet: pageInterface = {
  name: 'AnimePlanet',
  domain: 'https://www.anime-planet.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[6] === null) {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('h2.sub a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return AnimePlanet.domain + (j.$('h2.sub a').attr('href') || '');
    },
    getEpisode(url) {
      const episodePart = utils.getBaseText($('h2.sub')).replace(/\r?\n|\r/g, '');
      if (episodePart.length) {
        const temp = episodePart.match(/.*-/g);
        if (temp !== null) {
          return temp[0].replace(/\D+/g, '');
        }
      }
      return NaN;
    },
    uiSelector(selector) {
      j.$('#siteContainer > nav')
        .first()
        .before(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#siteContainer > h1').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('#siteContainer > nav')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'anime' && utils.urlPart(page.url, 4) !== 'all') {
        page.handlePage();
      }
    });
  },
};
