import { pageInterface } from '../pageInterface';

export const Animevibe: pageInterface = {
  name: 'Animevibe',
  domain: ['https://animevibe.wtf', 'https://animemate.xyz'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'ani') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText(j.$('div.episode-title-episode > h3')).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${Animevibe.domain}/ani/${Animevibe.sync.getIdentifier(url)}/1/`;
    },
    getEpisode(url) {
      if (!utils.urlPart(url, 5)) {
        return 1;
      }
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      return j.$('div.player-section.container-fluid > a:contains("Next Episode")').attr('href');
    },
    uiSelector(selector) {
      j.$('div.episode-title-episode > h3').after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // no Ui
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#collapse-episode > div.wrap-episode-list > a, #collapse-episode > div.wrap-episode-list > button');
      },
      elementUrl(selector) {
        return `${Animevibe.domain}/ani/${Animevibe.sync.getIdentifier(
          window.location.href,
        )}/${selector.text().trim()}/`;
      },
      elementEp(selector) {
        return Animevibe.sync.getEpisode(Animevibe.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
