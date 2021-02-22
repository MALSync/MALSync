import { pageInterface } from '../pageInterface';

export const AnimesVision: pageInterface = {
  name: 'AnimesVision',
  domain: 'https://animesvision.biz',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils
        .getBaseText($('div.goblock.play-anime > div.gobread > ol > li.active > h1'))
        .replace(/Dublado/gim, '')
        .replace(/[\s-\s]*$/, '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('#episodes-sv-1 > li > div.sli-name > a').attr('href') || '';
    },
    getEpisode(url) {
      const episodetemp = utils.urlPart(url, 5).replace(/\D+/, '');

      if (!episodetemp) return 1;

      return Number(episodetemp);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(j.$('#nextEp').attr('href'), AnimesVision.domain);
    },
  },
  overview: {
    getTitle(url) {
      return utils
        .getBaseText($('div.goblock.detail-anime > div.gobread > ol > li.active > span'))
        .replace(/Dublado/gim, '')
        .replace(/[\s-\s]*$/, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.goblock.detail-anime > div.goblock-content.go-full > div.detail-content').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episodes-sv-1 > li.ep-item');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .attr('href')
            ?.split('/')?.[5]
            ?.replace(/\D+/, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'animes' || page.url.split('/')[3] === 'filmes') {
        page.handlePage();
      }
    });
  },
};
