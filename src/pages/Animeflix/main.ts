import { pageInterface } from '../pageInterface';

export const Animeflix: pageInterface = {
  name: 'Animeflix',
  domain: 'https://animeflix.io',
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
      return utils
        .getBaseText($('h4.title.text-truncate, h4.headline.text-truncate').first())
        .replace('()', '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${Animeflix.domain}/shows/${Animeflix.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d*-/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.flex.xs12.lg8 > h1')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.my-3')
        .first()
        .after(j.html(`<div class="container"> ${selector}</div>`));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    function check() {
      if (page.url.split('/')[3] === 'shows') {
        utils.waitUntilTrue(
          function() {
            if (
              j.$('h4.title.text-truncate').text() ||
              j.$('h4.headline.text-truncate').text() ||
              j.$('div.flex.xs12.lg8 > h1').text()
            ) {
              return true;
            }
            return false;
          },
          function() {
            page.handlePage();
          },
        );
      }
    }
    check();
    utils.urlChangeDetect(function() {
      page.reset();
      check();
    });
  },
};
