import { pageInterface } from '../pageInterface';

export const Shinden: pageInterface = {
  name: 'Shinden',
  domain: 'https://shinden.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    const urlPart = url.split('/')[3];
    if (urlPart === 'episode' || urlPart === 'epek') return true;
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.page-title > a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.player-navigator > li:nth-child(2) > a').attr('href'), Shinden.domain);
    },
    getEpisode(url) {
      const episodeText = j.$('dl.info-aside-list:nth-child(1) > dd:nth-child(2)').text();

      if (!episodeText) return NaN;

      return Number(episodeText.replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(j.$('.player-navigator > li:nth-child(3) > a').attr('href'), Shinden.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.page-title')
        .text()
        .replace(/anime:/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('.title-other')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.list-episode-checkboxes > tr:has(.fa-check)');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Shinden.domain,
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('td')
            .first()
            .text(),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      const urlPart = page.url.split('/')[3];
      if (urlPart === 'series' || urlPart === 'episode' || urlPart === 'titles' || urlPart === 'epek') {
        page.handlePage();
      }
    });
  },
};
