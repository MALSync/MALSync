import { pageInterface } from '../pageInterface';

export const Anime4you: pageInterface = {
  name: 'Anime4you',
  domain: 'https://www.anime4you.one',
  database: 'Anime4you',
  languages: ['German'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[7] !== 'epi') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText(j.$('div.titel > h3'));
    },
    getIdentifier(url) {
      return parseInt(utils.urlPart(url, 6)).toString();
    },
    getOverviewUrl(url) {
      return `${Anime4you.domain}/show/1/aid/${Anime4you.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 8));
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('.vidplayer .forward a')
        .first()
        .attr('href');
      if (!nextEp) return nextEp;
      return Anime4you.domain + nextEp;
    },
    uiSelector(selector) {
      j.$('.beschreibung > div > p')
        .first()
        .after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return Anime4you.sync.getTitle(url);
    },
    getIdentifier(url) {
      return Anime4you.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      Anime4you.sync!.uiSelector!(selector);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episoden li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Anime4you.domain,
        );
      },
      elementEp(selector) {
        return Anime4you.sync!.getEpisode(Anime4you.overview!.list!.elementUrl(selector));
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
