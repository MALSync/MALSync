import { pageInterface } from '../pageInterface';

function cleanTitle(title: string) {
  return title
    .replace(/(VF)|(VOSTFR)/gim, '')
    .replace(/Saison/gim, 'Season')
    .replace(/Partie/gim, 'Part')
    .trim();
}

export const ToonAnime: pageInterface = {
  name: 'ToonAnime',
  domain: 'https://vvww.toonanime.cc',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return j.$('.ss-list').length > 0;
  },
  isOverviewPage(url) {
    return url.endsWith('-tv.html');
  },
  sync: {
    getTitle(url) {
      return cleanTitle(j.$('.ss-list > .ssl-item.active').first().attr('title') || '');
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3).split('-')[0] || '';
    },
    getOverviewUrl(url) {
      return `${ToonAnime.domain}/anime/${ToonAnime.sync.getIdentifier(url)}-tv.html`;
    },
    getEpisode(url) {
      return Number(j.$('.ss-list > .ssl-item.active').first().attr('data-number'));
    },
    nextEpUrl(url) {
      return j.$('.ss-list > .ssl-item.active').next().attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return cleanTitle(j.$('.content__sidebar-sub--header.h3').first().text());
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3).split('-')[0] || '';
    },
    uiSelector(selector) {
      j.$('.full_subcontent.fx_row').next().next().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.ss-list > .ep-item');
      },
      elementUrl(selector) {
        return selector.attr('href') || '';
      },
      elementEp(selector) {
        return Number(selector.attr('data-number'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
