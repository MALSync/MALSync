import { pageInterface } from '../pageInterface';

export const AnimeSuge: pageInterface = {
  name: 'AnimeSuge',
  domain: 'https://animesuge.cz',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 5) !== '';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 4) !== '' && utils.urlPart(url, 5) === '';
  },
  sync: {
    getTitle(url) {
      return j.$('title').text()
        .replace(/\s*Episode\s*\d+/i, '')
        .replace(/\s*[-–|]\s*Watch Anime Online.*$/i, '')
        .trim();
    },
    getIdentifier(url) {
      const slug = utils.urlPart(url, 4);
      const match = slug.match(/-([a-z0-9]+)$/);
      return match ? match[1] : slug;
    },
    getOverviewUrl(url) {
      return `${AnimeSuge.domain}/anime/${utils.urlPart(url, 4)}`;
    },
    getEpisode(url) {
      const epPart = utils.urlPart(url, 5);
      const match = epPart.match(/ep-(\d+)/);
      return match ? parseInt(match[1]) : 1;
    },
    nextEpUrl(url) {
      const currentEp = AnimeSuge.sync.getEpisode(url);
      const identifier = utils.urlPart(url, 4);
      return `${AnimeSuge.domain}/anime/${identifier}/ep-${currentEp + 1}`;
    },
    uiSelector(selector) {
      j.$('.malp-group.malp-group-episode').after(j.html(`<div>${selector}</div>`));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('title').text()
        .replace(/\s*Episode\s*\d+/i, '')
        .replace(/\s*[-–|]\s*Watch Anime Online.*$/i, '')
        .trim();
    },
    getIdentifier(url) {
      const slug = utils.urlPart(url, 4);
      const match = slug.match(/-([a-z0-9]+)$/);
      return match ? match[1] : slug;
    },
    uiSelector(selector) {
      j.$('.anime-detail, .details, main').first()
        .prepend(j.html(`<div>${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('a[href*="/ep-"]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeSuge.domain);
      },
      elementEp(selector) {
        const href = selector.attr('href') || '';
        const match = href.match(/ep-(\d+)/);
        return match ? parseInt(match[1]) : 1;
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
    utils.changeDetect(
      () => { page.handlePage(); },
      () => window.location.href,
    );
  },
};
