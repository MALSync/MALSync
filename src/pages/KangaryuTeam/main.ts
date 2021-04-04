import { pageInterface } from '../pageInterface';

export const KangaryuTeam: pageInterface = {
  name: 'KangaryuTeam',
  domain: 'https://kangaryu-team.fr',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return typeof url.split('/')[5] !== 'undefined' && url.split('/')[5].length > 0;
  },
  sync: {
    getTitle() {
      return j
        .$('#navbar-collapse-1 > ul > li:nth-child(1) > a')
        .text()
        .replace('Manga', '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${KangaryuTeam.domain}/manga/${utils.urlPart(url, 4)}`;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.col-sm-12 >.ac-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.bg > div:nth-child(3)')
        .first()
        .before(j.html(`<div class="bg-list rounded">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.bg-list > ul.chapters > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a[href*="/manga/"]').attr('href') || '', KangaryuTeam.domain);
      },
      elementEp(selector) {
        return KangaryuTeam.sync.getEpisode(KangaryuTeam.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'manga' && typeof page.url.split('/')[4] !== 'undefined') {
        page.handlePage();
      }
    });
  },
};
