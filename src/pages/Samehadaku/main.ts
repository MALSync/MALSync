import { pageInterface } from '../pageInterface';

export const Samehadaku: pageInterface = {
  name: 'Samehadaku',
  domain: 'https://samehadaku.vip',
  languages: ['Indonesian'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'anime') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('div.infoeps > div.episodeinf > div.infoanime > div > div.infox > h2').text();
    },
    getIdentifier(url) {
      return Samehadaku.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('div.naveps > div.nvs.nvsc > a').attr('href'), Samehadaku.domain);
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d+/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$("div.naveps > div.nvs.rght > a:not('.nonex')").attr('href');
      if (href) return utils.absoluteLink(href, Samehadaku.domain);
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#infoarea > div > div.infoanime > div.infox > h1.entry-title')
        .text()
        .replace(/subtitle indonesia/i, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('#infoarea > div > div.infoanime > div.infox > h1.entry-title').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.lstepsiode.listeps > ul > div > div > li');
      },
      elementUrl(selector) {
        return selector.find('div.epsright > span.eps > a').attr('href') || '';
      },
      elementEp(selector) {
        return Samehadaku.sync.getEpisode(Samehadaku.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'anime' ||
        (j.$('div.player-area.widget_senction > div.plarea').length &&
          j.$('div.infoeps > div.episodeinf > div.infoanime > div > div.infox > h2').length &&
          j.$('div.naveps > div.nvs.nvsc > a').length)
      ) {
        page.handlePage();
      }
    });
  },
};
