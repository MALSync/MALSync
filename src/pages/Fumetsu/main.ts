import { pageInterface } from '../pageInterface';

export const Fumetsu: pageInterface = {
  name: 'Fumetsu',
  domain: 'https://fumetsu.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    return url.split('/')[5] !== '';
  },
  sync: {
    getTitle(url) {
      return j.$('.text-center > a > h2').text() || '';
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('.text-center > a')
          .first()
          .attr('href'),
        Fumetsu.domain,
      );
    },
    getEpisode(url) {
      return getEpNumber(j.$('.text-center > h5').text());
    },
    nextEpUrl(url) {
      const nextEp = j.$('.text-center > a.float-right').attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, Fumetsu.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.ep-info h2')
        .first()
        .text();
    },
    getIdentifier(url) {
      return Fumetsu.sync!.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.newsy.container > .row')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episodes');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          j
            .$(selector)
            .parent()
            .attr('href'),
          Fumetsu.domain,
        );
      },
      elementEp(selector) {
        return getEpNumber(
          j
            .$(selector)
            .find('.float-left')
            .text(),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'anime' &&
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0
      ) {
        page.handlePage();
      }
    });
  },
};

function getEpNumber(text) {
  const pattern = /Odcinek:?\s?([0-9]+)/;
  const ep = text.trim().match(pattern);
  if (!ep) return ep;
  return Number(ep[1]);
}
