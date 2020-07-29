import { pageInterface } from '../pageInterface';

export const Otakustream: pageInterface = {
  name: 'Otakustream',
  domain: 'https://otakustream.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'movie') return true;
    if (typeof url.split('/')[5] === 'undefined' || url.split('/')[5] === '') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      if (url.split('/')[3] === 'movie') return Otakustream.overview!.getTitle(url);
      return j
        .$('#breadcrumbs a')
        .last()
        .text()
        .trim();
    },
    getIdentifier(url) {
      const urlPart4 = utils.urlPart(url, 4);

      if (!urlPart4) return '';

      return urlPart4.toLowerCase();
    },
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      let EpText = utils.urlPart(url, 5);

      if (!EpText) return NaN;

      let temp = EpText.match(/-\d+/);

      if (temp !== null) {
        EpText = temp[0];
      }
      temp = EpText.match(/\d+/);
      if (temp === null) {
        return 1;
      }
      return parseInt(temp[0]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('.navigation-right')
          .first()
          .attr('href'),
        Otakustream.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.breadcrumb_last')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return Otakustream.sync!.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.single-details h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.ep-list li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Otakustream.domain,
        );
      },
      elementEp(selector) {
        return Otakustream.sync!.getEpisode(Otakustream.overview!.list!.elementUrl(selector));
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
