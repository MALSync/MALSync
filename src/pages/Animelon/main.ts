import { urlChangeDetect } from '../../utils/general';
import { pageInterface } from '../pageInterface';

let syncPageEpTitle;

export const Animelon: pageInterface = {
  name: 'Animelon',
  domain: 'https://www.animelon.com',
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
      return syncPageEpTitle.replace(/\sEpisode\s\d+$/, '');
    },
    getIdentifier(url) {
      return encodeURI(syncPageEpTitle.replace(/\sEpisode\s\d+$/, ''));
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        `/series/${encodeURI(syncPageEpTitle.replace(/\sEpisode\s\d+$/, ''))}`,
        Animelon.domain,
      );
    },
    getEpisode(url) {
      return parseInt(syncPageEpTitle.match(/\d+$/)![0]) ?? 0;
    },
  },
  overview: {
    getTitle(url) {
      return decodeURI(utils.urlPart(url, 4));
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.right-head-container').append(j.html(selector));
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
        return parseInt(selector.find('[ng-bind="episode.title"]').text().match(/\d+$/)![0]) ?? 0;
      },
      getTotal() {
        return parseInt(j.$('ng-bind="series.totalEpisodes"').text()) ?? 0;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(waitPageLoad);
    urlChangeDetect(waitPageLoad);
    function waitPageLoad() {
      if (Animelon.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          function () {
            return j.$('[ng-bind="languageVideo.title"]').text().length > 0;
          },
          function () {
            syncPageEpTitle = j.$('[ng-bind="languageVideo.title"]').text();
            page.handlePage();
          },
        );
      } else {
        utils.waitUntilTrue(
          function () {
            return (
              j.$('.series-page .right-head-container').length &&
              j.$('.season-episodes-container > .episode-container').length
            );
          },
          function () {
            page.handlePage();
          },
        );
      }
    }
  },
};
