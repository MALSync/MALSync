import { pageInterface } from '../pageInterface';

export const AnimeOdcinki: pageInterface = {
  name: 'AnimeOdcinki',
  domain: 'https://anime-odcinki.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    return url.split('/')[5] !== undefined;
  },
  sync: {
    getTitle(url) {
      return j.$('.field-name-field-tytul-anime a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.field-name-field-tytul-anime a').attr('href'), AnimeOdcinki.domain);
    },
    getEpisode(url) {
      return parseInt(url.split('/')[5]);
    },
    nextEpUrl(url) {
      return j.$('#video-next').attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.page-header').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('#user-anime-top')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.view-content > ul > li.lista_odc_tytul_pozycja');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .attr('href')
            ?.split('/')?.[5]
            ?.match(/\d+/gim),
        );
      },
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[5] !== undefined) {
        page.handlePage();
      } else {
        utils.waitUntilTrue(
          function() {
            return j.$('div.view-content').length;
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
