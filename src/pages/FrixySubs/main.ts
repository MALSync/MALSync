import { pageInterface } from '../pageInterface';

export const FrixySubs: pageInterface = {
  name: 'FrixySubs',
  domain: 'https://frixysubs.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlParam(url, 'sezon') !== '0' || utils.urlParam(url, 'film') === 'tak') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (
      utils.urlParam(url, 'sezon') === '0' &&
      utils.urlParam(url, 'odcinek') === '0' &&
      utils.urlParam(url, 'film') !== 'tak'
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.urlParam(url, 'anime') || '';
    },
    getIdentifier(url) {
      const title = utils.urlParam(url, 'anime') || '';
      return encodeURI(title);
    },
    getOverviewUrl(url) {
      const overviewUrl = j
        .$('.btn.btn-primary.display-4')
        .first()
        .attr('href');
      return utils.absoluteLink(overviewUrl, FrixySubs.domain);
    },
    getEpisode(url) {
      const episodeText = utils.urlParam(url, 'odcinek');

      if (!episodeText) return NaN;

      return Number(episodeText);
    },
    nextEpUrl(url) {
      const nextEpUrl = j
        .$('.btn.btn-primary.display-4')
        .last()
        .attr('href');

      return utils.absoluteLink(nextEpUrl, FrixySubs.domain);
    },
  },
  overview: {
    getTitle(url) {
      return FrixySubs.sync.getTitle(url);
    },
    getIdentifier(url) {
      return FrixySubs.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.container')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.mbr-gallery-item');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          j
            .$(selector)
            .parent()
            .attr('href'),
          FrixySubs.domain,
        );
      },
      elementEp(selector) {
        return getEpNumber(selector.find('.mbr-gallery-title').text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (utils.urlParam(page.url, 'anime') !== null && utils.urlParam(page.url, 'anime') !== 0) {
        page.handlePage();
      }
    });
  },
};

function getEpNumber(title) {
  const pattern = /#([0-9]*)\s-/;
  const epNumber = title.match(pattern);
  if (!epNumber[1]) return NaN;
  return Number(epNumber[1]);
}
