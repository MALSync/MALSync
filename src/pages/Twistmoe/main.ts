import { pageInterface } from '../pageInterface';

export const Twistmoe: pageInterface = {
  name: 'Twistmoe',
  domain: 'https://twist.moe',
  database: 'Twistmoe',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.series-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return `${Twistmoe.domain}/a/${Twistmoe.sync.getIdentifier(url)}/1`;
    },
    getEpisode(url) {
      const urlPart5 = utils.urlPart(url, 5);

      if (!urlPart5) return NaN;

      return parseInt(urlPart5);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('.episode-list .current')
          .first()
          .parent()
          .next()
          .find('a')
          .attr('href'),
        Twistmoe.domain,
      );
    },
    uiSelector(selector) {
      j.$('.information')
        .first()
        .after(j.html(selector));
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
      return '';
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episode-list li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Twistmoe.domain,
        );
      },
      elementEp(selector) {
        return Twistmoe.sync!.getEpisode(Twistmoe.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    const start = () => {
      if (
        !$('.information .series-title')
          .text()
          .trim()
      )
        return;

      const urlPart3 = utils.urlPart(page.url, 3);

      if (!urlPart3) {
        con.log('Not an anime page!');

        return;
      }

      page.handlePage();
    };

    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      start();

      utils.changeDetect(
        () => {
          page.reset();
          start();
        },
        () => {
          return $('.information').text();
        },
      );
    });
  },
};
