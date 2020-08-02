import { pageInterface } from '../pageInterface';

export const Voiranime: pageInterface = {
  name: 'Voiranime',
  domain: 'http://voiranime.com',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if ($('.video-series-wrap').length) return true;
    return false;
  },
  sync: {
    getTitle(url) {
      return $('h1')
        .first()
        .text()
        .trim()
        .split(' – ')[0];
    },
    getIdentifier(url) {
      const urlPart3 = utils.urlPart(url, 3);

      if (!urlPart3 || urlPart3.length === 0) return '';

      return urlPart3.replace(/(-saison-[^-]*)?-[^-]*-[^-]*$/i, '');
    },
    getOverviewUrl(url) {
      return `${Voiranime.domain}/${Voiranime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return parseInt(
        $('.series-current')
          .first()
          .text()
          .trim(),
      );
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('.series-current')
          .first()
          .closest('li')
          .next()
          .find('a')
          .attr('href'),
        Voiranime.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return $('h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3) || '';
    },
    uiSelector(selector) {
      j.$('h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.video-series-list > li:not(.series-title)');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Voiranime.domain,
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .text()
            .replace(/\D+/, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if ($('.video-series-wrap').length || $('.category-anime-serie').length) {
        page.handlePage();
      }
    });
  },
};
