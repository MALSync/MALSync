import { pageInterface } from '../pageInterface';

export const OtakuFR: pageInterface = {
  name: 'OtakuFR',
  domain: 'https://otakufr.co',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('#player-0 > iframe').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#app-otaku > section > div > div > div.col-md-8 > div > nav > ol > li:nth-child(2) > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return (
        j.$('#app-otaku > section > div > div > div.col-md-8 > div > nav > ol > li:nth-child(2) > a').attr('href') || ''
      );
    },
    getEpisode(url) {
      const selectedOptionText = j
        .$('#app-otaku > section > div > div > div.col-md-8 > div > div.title.h1.mt-4.wp-dark-mode-ignore')
        .text();

      console.log(`Data ${selectedOptionText.split(' ').slice(-2)[0]}`);
      return Number(selectedOptionText.split(' ').slice(-2)[0]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(j.$('.players > div > div:nth-child(3) > a').attr('href'), OtakuFR.domain);
    },
  },

  overview: {
    getTitle(url) {
      return j.$('.list > div:nth-child(1)').text();
    },
    getIdentifier(url) {
      return OtakuFR.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.card')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$(
          '#app-otaku > section > div > div > div.col-md-8.order-1 > div > article > div > div:nth-child(2) > div > div.list-episodes.list-group > a',
        );
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), OtakuFR.domain);
      },
      elementEp(selector) {
        return Number(
          selector
            .first()
            .text()
            .match(/(\d+) (?:Vostfr|VF)/)[1],
        );
      },
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        $('#player-0 > iframe').length ||
        $('.card-body > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)').length
      ) {
        page.handlePage();
      }
    });
  },
};
