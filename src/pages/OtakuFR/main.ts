import { pageInterface } from '../pageInterface';

export const OtakuFR: pageInterface = {
  name: 'OtakuFR',
  domain: 'https://otakufr.co',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'episode' && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'anime' && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.single-episode > nav li > a[href*="/anime/"]')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(OtakuFR.sync.getOverviewUrl(url), 4) || '';
    },
    getOverviewUrl(url) {
      return j.$('.single-episode > nav li > a[href*="/anime/"]').attr('href') || '';
    },
    getEpisode(url) {
      return getEp(utils.urlPart(url, 4));
    },
    nextEpUrl(url) {
      const nextEp = j.$('.players > div > div:nth-child(3) > a').attr('href');
      if (!nextEp || nextEp.includes('javascript')) return '';
      return utils.absoluteLink(nextEp, OtakuFR.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.list > div')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.card')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('div.list-episodes.list-group > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), OtakuFR.domain);
      },
      elementEp(selector) {
        return getEp(utils.urlPart(OtakuFR.overview!.list!.elementUrl(selector), 4));
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

function getEp(urlPath) {
  const ep = urlPath.match(/(\d+-(vostfr|vf))|((vostfr|vf)-\d+)/i);
  if (!ep || !ep.length) return 1;
  return Number(ep[0].match(/\d+/)[0]);
}
