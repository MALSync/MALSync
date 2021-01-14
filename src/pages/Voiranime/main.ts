import { pageInterface } from '../pageInterface';

export const Voiranime: pageInterface = {
  name: 'Voiranime',
  domain: 'https://voiranime.com',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if ($('.chapter-video-frame').length) return true;
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.breadcrumb > li:nth-child(2) > a:nth-child(1)')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return `${Voiranime.domain}/anime/${Voiranime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number(
        j.$('div.select-view:nth-child(2) > div:nth-child(2) > label:nth-child(1) > select >option:selected').text(),
      );
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('div.select-pagination:nth-child(3) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)').attr('href'),
        Voiranime.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return $('.post-title > h1:nth-child(1)')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('.post-title > h1:nth-child(1)')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), Voiranime.domain);
      },
      elementEp(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .text()
            .split('-')
            .pop(),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        $('.chapter-video-frame').length ||
        $('body > div.wrap > div > div.site-content > div > div.profile-manga > div > div > div > div.tab-summary')
          .length
      ) {
        page.handlePage();
      }
    });
  },
};
