import { pageInterface } from '../pageInterface';

export const FrixySubs: pageInterface = {
  name: 'FrixySubs',
  domain: 'https://frixysubs.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3].startsWith('ogladaj')) return true;
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3].startsWith('odcinki')) return true;
    return false;
  },
  sync: {
    getTitle(url) {
      const title = j.$('#anime-watch-title').text();
      if (!title) return j.$('#watch-title').text() || '';
      return title;
    },
    getIdentifier(url) {
      const isMovie = utils.urlParam(url, 'video');
      if (isMovie === 'true') {
        const id = utils.urlParam(url, 'id') || '';
        return `${id}v`;
      }
      return j.$('.watch-player-button:contains("Wróć")').attr('idd') || '';
    },
    getOverviewUrl(url) {
      const id = j.$('.watch-player-button:contains("Wróć")').attr('idd');
      if (!id) return '';
      return utils.absoluteLink(`odcinki.html?id=${id}`, FrixySubs.domain);
    },
    getEpisode(url) {
      const text = j.$('#watch-title').text();
      return getEpNumber(text, /\|#(\d+)/);
    },
    nextEpUrl(url) {
      const id = j.$('.watch-player-button:contains("Następny")').attr('idd');
      if (!id) return '';
      return utils.absoluteLink(`ogladaj.html?id=${id}`, FrixySubs.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#series-info-title').text();
    },
    getIdentifier(url) {
      return utils.urlParam(url, 'id') || '';
    },
    uiSelector(selector) {
      j.$('#series-info').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episodes-episode');
      },
      elementUrl(selector) {
        const id = j.$(selector).attr('idd');
        return utils.absoluteLink(`ogladaj.html?id=${id}`, FrixySubs.domain);
      },
      elementEp(selector) {
        const text = j
          .$(selector)
          .find('.episodes-h1')
          .text();
        return getEpNumber(text, /Odcinek (\d+)/);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      const urlPart = page.url.split('/')[3];
      if (urlPart.startsWith('ogladaj') || urlPart.startsWith('odcinki')) {
        utils.waitUntilTrue(
          () => {
            if (FrixySubs.overview!.getTitle(page.url).length || FrixySubs.sync.getTitle(page.url).length) return true;
            return false;
          },
          () => {
            page.handlePage();
          },
        );
      }
    });
  },
};

function getEpNumber(text, pattern): number {
  const ep = text.match(pattern);
  if (!ep) return 1;
  return parseInt(ep[1]);
}
