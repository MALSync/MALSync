import { pageInterface } from '../pageInterface';

export const Animelon: pageInterface = {
  name: 'Animelon',
  domain: 'https://www.animelon.com/',
  languages: ['English', 'Japanese'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'video' && utils.urlPart(url, 4).length !== 0;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'series' && utils.urlPart(url, 4).length !== 0;
  },
  sync: {
    getTitle(url) {
      return j
        .$('ng-bind="languageVideo.title"')
        .text()
        .replace(/\sEpisode\s\d+$/, '');
    },
    getIdentifier(url) {
      return j
        .$('ng-bind="languageVideo.title"')
        .text()
        .replace(/\sEpisode\s\d+$/, '')
        .replace(/\s/g, '%20');
    },
    getOverviewUrl(url) {
      return j
        .$('ng-bind="languageVideo.title"')
        .text()
        .replace(/\sEpisode\s\d+$/, '');
    },
    getEpisode(url) {
      return parseInt(j.$('ng-bind="languageVideo.title"').text().match(/\d+$/)![0]) ?? 0;
    },
  },
  overview: {
    getTitle(url) {
      return utils.urlPart(url, 4);
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.series-page .right-head-container').children().last().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.season-episodes-container > .episode-container');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Animelon.domain);
      },
      elementEp(selector) {
        return parseInt(selector.find('ng-bind="episode.title').text().match(/\d+$/)![0]) ?? 0;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(function () {
      page.handlePage();
    });
  },
};
